from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Appointment, ScanResult
from ..schemas import DashboardStats, PatientListItem, PatientDetail, ScanResultOut, AppointmentOut, AnalyticsOut, RiskDistribution
from ..core.deps import require_doctor

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _patient_risk(patient: User) -> str:
    if not patient.scan_results:
        return "Medium"
    last = max(patient.scan_results, key=lambda s: s.created_at)
    return "High" if last.prediction == "cancer" else "Low"


@router.get("/stats", response_model=DashboardStats)
def stats(
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor),   # ← actually use the doctor's identity
):
    # All patients in the system
    patients = db.query(User).filter(User.role == "patient", User.is_active == True).all()
    total   = len(patients)
    high    = sum(1 for p in patients if _patient_risk(p) == "High")
    medium  = sum(1 for p in patients if _patient_risk(p) == "Medium")
    low     = sum(1 for p in patients if _patient_risk(p) == "Low")

    # Scans in the last 7 days (system-wide is fine for overview)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_scans = db.query(ScanResult).filter(ScanResult.created_at >= week_ago).count()

    # TODAY's appointments for THIS doctor
    today       = datetime.utcnow().date()
    today_start = datetime(today.year, today.month, today.day)
    today_end   = today_start + timedelta(days=1)
    today_appts = db.query(Appointment).filter(
        Appointment.doctor_id == current_doctor.id,
        Appointment.appointment_datetime >= today_start,
        Appointment.appointment_datetime < today_end,
        Appointment.status != "cancelled",
    ).count()

    # ALL upcoming (future, non-cancelled) appointments for THIS doctor
    now = datetime.utcnow()
    upcoming_appts = db.query(Appointment).filter(
        Appointment.doctor_id == current_doctor.id,
        Appointment.appointment_datetime >= now,
        Appointment.status != "cancelled",
    ).count()

    return DashboardStats(
        total_patients=total,
        high_risk=high,
        medium_risk=medium,
        low_risk=low,
        recent_scans_7d=recent_scans,
        today_appointments=today_appts,
        pending_appointments=upcoming_appts,   # ← now means "my upcoming", not system-wide pending
    )


@router.get("/patients", response_model=list[PatientListItem])
def patients_list(
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor),
):
    # Return patients who have at least one appointment with THIS doctor
    # Fall back to all patients if doctor has none yet (so dashboard isn't empty on first login)
    doctor_patient_ids = (
        db.query(Appointment.patient_id)
        .filter(Appointment.doctor_id == current_doctor.id)
        .distinct()
        .all()
    )
    pid_set = {row[0] for row in doctor_patient_ids}

    # Use doctor's patients if available, otherwise show all patients
    if pid_set:
        patients = db.query(User).filter(User.id.in_(pid_set), User.is_active == True).all()
    else:
        patients = db.query(User).filter(User.role == "patient", User.is_active == True).all()

    result = []
    for p in patients:
        scans = sorted(p.scan_results, key=lambda s: s.created_at, reverse=True)
        last_scan = scans[0] if scans else None
        result.append(PatientListItem(
            id=p.id,
            full_name=p.full_name,
            email=p.email,
            age=p.age,
            last_scan_date=last_scan.created_at if last_scan else None,
            last_scan_result=last_scan.prediction if last_scan else None,
            risk=_patient_risk(p),
            scan_count=len(scans),
        ))
    return result


@router.get("/patients/{patient_id}", response_model=PatientDetail)
def patient_detail(
    patient_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_doctor),
):
    from ..routers.appointments import _hydrate
    patient = db.query(User).filter(User.id == patient_id, User.role == "patient").first()
    if not patient:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Patient not found")

    scans = sorted(patient.scan_results, key=lambda s: s.created_at, reverse=True)
    appts = sorted(patient.appointments_as_patient, key=lambda a: a.appointment_datetime)

    return PatientDetail(
        id=patient.id,
        full_name=patient.full_name,
        email=patient.email,
        age=patient.age,
        risk=_patient_risk(patient),
        scan_results=[ScanResultOut.model_validate(s) for s in scans],
        appointments=[_hydrate(a, db) for a in appts],
    )


@router.get("/analytics", response_model=AnalyticsOut)
def analytics(
    db: Session = Depends(get_db),
    current_doctor: User = Depends(require_doctor),
):
    # Scans for patients of THIS doctor only
    doctor_patient_ids = {
        row[0] for row in
        db.query(Appointment.patient_id)
        .filter(Appointment.doctor_id == current_doctor.id)
        .distinct()
        .all()
    }

    if doctor_patient_ids:
        all_scans = db.query(ScanResult).filter(ScanResult.patient_id.in_(doctor_patient_ids)).all()
        patients  = db.query(User).filter(User.id.in_(doctor_patient_ids)).all()
        all_appts = db.query(Appointment).filter(Appointment.doctor_id == current_doctor.id).all()
    else:
        # First-time doctor: fall back to system-wide data so dashboard isn't blank
        all_scans = db.query(ScanResult).all()
        patients  = db.query(User).filter(User.role == "patient").all()
        all_appts = db.query(Appointment).all()

    total        = len(all_scans)
    cancer_count = sum(1 for s in all_scans if s.prediction == "cancer")
    normal_count = total - cancer_count
    cancer_rate  = round((cancer_count / total * 100), 1) if total > 0 else 0.0

    # Scans per week (last 4 weeks)
    scans_per_week = []
    for i in range(3, -1, -1):
        week_start = datetime.utcnow() - timedelta(weeks=i + 1)
        week_end   = datetime.utcnow() - timedelta(weeks=i)
        count = sum(1 for s in all_scans if week_start <= s.created_at < week_end)
        scans_per_week.append({"week": f"W-{i + 1}" if i > 0 else "This week", "count": count})

    # Symptom breakdown
    symptom_breakdown = {"1": 0, "2": 0, "3": 0}
    for s in all_scans:
        if s.symptom_type in symptom_breakdown:
            symptom_breakdown[s.symptom_type] += 1

    # Risk distribution of this doctor's patients
    risk_dist = {"high": 0, "medium": 0, "low": 0}
    for p in patients:
        r = _patient_risk(p).lower()
        risk_dist[r] = risk_dist.get(r, 0) + 1

    # Age distribution
    age_buckets: dict[str, int] = {"20-30": 0, "30-40": 0, "40-50": 0, "50-60": 0, "60+": 0}
    for p in patients:
        if p.age is None:
            continue
        if p.age < 30:
            age_buckets["20-30"] += 1
        elif p.age < 40:
            age_buckets["30-40"] += 1
        elif p.age < 50:
            age_buckets["40-50"] += 1
        elif p.age < 60:
            age_buckets["50-60"] += 1
        else:
            age_buckets["60+"] += 1

    total_appts = len(all_appts)
    appt_status: dict[str, int] = {}
    for a in all_appts:
        appt_status[a.status] = appt_status.get(a.status, 0) + 1

    return AnalyticsOut(
        total_scans=total,
        cancer_count=cancer_count,
        normal_count=normal_count,
        cancer_rate=cancer_rate,
        scans_per_week=scans_per_week,
        symptom_breakdown=symptom_breakdown,
        total_appointments=total_appts,
        appointment_status_breakdown=appt_status,
        risk_distribution=RiskDistribution(
            high=risk_dist["high"],
            medium=risk_dist["medium"],
            low=risk_dist["low"],
        ),
        age_distribution=age_buckets,
        total_patients=len(patients),
    )
