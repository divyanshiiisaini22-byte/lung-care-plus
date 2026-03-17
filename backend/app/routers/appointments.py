from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Appointment
from ..schemas import BookAppointmentRequest, AppointmentOut
from ..core.deps import get_current_user

router = APIRouter(prefix="/appointments", tags=["appointments"])

# Fixed UTC+5:30 offset — no tzdata package required
IST = timezone(timedelta(hours=5, minutes=30))


def _hydrate(appt: Appointment, db: Session) -> AppointmentOut:
    doctor = db.query(User).filter(User.slug == appt.doctor_slug, User.role == "doctor").first()
    patient = db.query(User).filter(User.id == appt.patient_id).first()
    return AppointmentOut(
        id=appt.id,
        doctor_name=appt.doctor_name,
        doctor_slug=appt.doctor_slug,
        appointment_datetime=appt.appointment_datetime,
        mode=appt.mode,
        status=appt.status,
        notes=appt.notes,
        booked_at=appt.booked_at,
        doctor_specialization=doctor.specialization if doctor else None,
        doctor_hospital=doctor.hospital_name if doctor else None,
        doctor_city=doctor.city if doctor else None,
        patient_name=patient.full_name if patient else None,
    )


@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def book(
    body: BookAppointmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments")

    doctor = db.query(User).filter(User.slug == body.doctor_slug, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Normalise to naive datetime so it's consistent with DB storage
    slot_dt = body.appointment_datetime
    if slot_dt.tzinfo is not None:
        slot_dt = slot_dt.replace(tzinfo=None)

    # Reject past slots — compare against current time (naive)
    now_naive = datetime.now(tz=IST).replace(tzinfo=None)
    if slot_dt <= now_naive:
        raise HTTPException(status_code=400, detail="Appointment slot must be in the future")

    # Block: same doctor + same slot already booked
    if db.query(Appointment).filter(
        Appointment.doctor_name == doctor.full_name,
        Appointment.appointment_datetime == slot_dt,
        Appointment.status != "cancelled",
    ).first():
        raise HTTPException(status_code=409, detail="This slot is already booked")

    # Block: patient already has an appointment with THIS doctor on that day
    slot_date = slot_dt.date()
    day_start = datetime(slot_date.year, slot_date.month, slot_date.day)
    day_end   = day_start + timedelta(days=1)
    if db.query(Appointment).filter(
        Appointment.patient_id == current_user.id,
        Appointment.doctor_name == doctor.full_name,
        Appointment.appointment_datetime >= day_start,
        Appointment.appointment_datetime < day_end,
        Appointment.status != "cancelled",
    ).first():
        raise HTTPException(status_code=409, detail="You already have a booking with this doctor on that day")

    # Block: patient has ANY appointment at the exact same time
    if db.query(Appointment).filter(
        Appointment.patient_id == current_user.id,
        Appointment.appointment_datetime == slot_dt,
        Appointment.status != "cancelled",
    ).first():
        raise HTTPException(status_code=409, detail="You already have an appointment at this time")

    appt = Appointment(
        patient_id=current_user.id,
        doctor_id=doctor.id,
        doctor_slug=doctor.slug,
        doctor_name=doctor.full_name,
        appointment_datetime=slot_dt,
        mode=body.mode,
        notes=body.notes,
        status="pending",
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return _hydrate(appt, db)


@router.get("/mine", response_model=list[AppointmentOut])
def my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "patient":
        appts = (
            db.query(Appointment)
            .filter(Appointment.patient_id == current_user.id)
            .order_by(Appointment.appointment_datetime.asc())
            .all()
        )
    else:  # doctor
        appts = (
            db.query(Appointment)
            .filter(
                Appointment.doctor_id == current_user.id,
                Appointment.status != "cancelled",
            )
            .order_by(Appointment.appointment_datetime.asc())
            .all()
        )
    return [_hydrate(a, db) for a in appts]


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appt.patient_id != current_user.id and appt.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your appointment")
    appt.status = "cancelled"
    db.commit()


@router.patch("/{appointment_id}/confirm", response_model=AppointmentOut)
def confirm(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can confirm appointments")
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == current_user.id,
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = "confirmed"
    db.commit()
    db.refresh(appt)
    return _hydrate(appt, db)
