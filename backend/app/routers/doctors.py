import json
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Appointment
from ..schemas import DoctorOut, DoctorDetailOut, SlotOut, DoctorMiniOut

router = APIRouter(prefix="/doctors", tags=["doctors"])

# IST is UTC+5:30 — use a fixed offset so we never need tzdata installed
IST = timezone(timedelta(hours=5, minutes=30))


def _now_ist() -> datetime:
    return datetime.now(tz=IST)


def _serialize_doctor(user: User) -> dict:
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "slug": user.slug or "",
        "specialization": user.specialization or "",
        "experience_years": user.experience_years or 0,
        "hospital_name": user.hospital_name or "",
        "bio": user.bio or "",
        "rating": user.rating or 4.5,
        "review_count": user.review_count or 0,
        "is_available": user.is_available if user.is_available is not None else True,
        "consultation_fee": user.consultation_fee or 500.0,
        "city": user.city or "",
        "country": user.country or "",
        "phone": user.phone,
        "consulting_hours": user.consulting_hours,
        "about": user.about,
        "languages": json.loads(user.languages) if user.languages else [],
        "badges": json.loads(user.badges) if user.badges else [],
        "accepts_virtual": user.accepts_virtual if user.accepts_virtual is not None else True,
        "next_available": user.next_available,
    }


@router.get("/", response_model=list[DoctorOut])
def list_doctors(db: Session = Depends(get_db)):
    doctors = db.query(User).filter(User.role == "doctor", User.is_active == True).all()
    return [DoctorOut(**_serialize_doctor(d)) for d in doctors]


@router.get("/{slug}", response_model=DoctorDetailOut)
def doctor_detail(slug: str, db: Session = Depends(get_db)):
    doctor = db.query(User).filter(User.slug == slug, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Calculate "tomorrow" in IST using a fixed UTC+5:30 offset (no tzdata needed)
    now_ist = _now_ist()
    tomorrow = (now_ist + timedelta(days=1)).date()

    # Window for tomorrow (naive datetimes, matching SQLite storage)
    day_start = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 0, 0, 0)
    day_end   = day_start + timedelta(days=1)

    # Fetch already-booked slots for this doctor tomorrow
    existing = db.query(Appointment).filter(
        Appointment.doctor_name == doctor.full_name,
        Appointment.appointment_datetime >= day_start,
        Appointment.appointment_datetime < day_end,
        Appointment.status != "cancelled",
    ).all()
    booked_hours = {a.appointment_datetime.hour for a in existing}

    # Generate hourly slots 9 AM–5 PM, skip 1 PM (lunch)
    slots: list[SlotOut] = []
    for hour in range(9, 17):
        if hour == 13:
            continue  # lunch break
        slot_dt = datetime(tomorrow.year, tomorrow.month, tomorrow.day, hour, 0, 0)

        # Build a readable label without platform-specific %-I
        display_hour = hour % 12 or 12
        am_pm = "AM" if hour < 12 else "PM"
        time_label = f"{display_hour}:00 {am_pm}"

        # ISO string — naive, consistent with what we store in the DB
        datetime_iso = slot_dt.isoformat()

        slots.append(SlotOut(
            datetime_iso=datetime_iso,
            time_label=time_label,
            available=hour not in booked_hours,
        ))

    data = _serialize_doctor(doctor)
    data["slots"] = [s.model_dump() for s in slots]
    return DoctorDetailOut(**data)


@router.get("/{slug}/mini", response_model=DoctorMiniOut)
def doctor_mini(slug: str, db: Session = Depends(get_db)):
    doctor = db.query(User).filter(User.slug == slug, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return DoctorMiniOut(**_serialize_doctor(doctor))
