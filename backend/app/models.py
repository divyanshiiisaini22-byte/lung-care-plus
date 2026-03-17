from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)          # "doctor" | "patient"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # ── Doctor-only fields ──────────────────────────────────────────────────
    slug = Column(String, unique=True, nullable=True, index=True)
    specialization = Column(String, nullable=True)
    experience_years = Column(Integer, nullable=True)
    hospital_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    rating = Column(Float, default=4.5)
    review_count = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    consultation_fee = Column(Float, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    consulting_hours = Column(String, nullable=True)
    about = Column(Text, nullable=True)
    languages = Column(String, nullable=True)          # JSON-serialised list
    badges = Column(String, nullable=True)             # JSON-serialised list
    accepts_virtual = Column(Boolean, default=True)
    next_available = Column(String, nullable=True)

    # ── Patient-only fields ─────────────────────────────────────────────────
    age = Column(Integer, nullable=True)

    # ── Relationships ───────────────────────────────────────────────────────
    appointments_as_patient = relationship(
        "Appointment", foreign_keys="Appointment.patient_id", back_populates="patient"
    )
    appointments_as_doctor = relationship(
        "Appointment", foreign_keys="Appointment.doctor_id", back_populates="doctor"
    )
    scan_results = relationship("ScanResult", back_populates="patient")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    doctor_slug = Column(String, nullable=True)
    doctor_name = Column(String, nullable=False)
    appointment_datetime = Column(DateTime, nullable=False)
    mode = Column(String, default="Virtual")           # "Virtual" | "In-person"
    status = Column(String, default="pending")         # "pending" | "confirmed" | "cancelled"
    notes = Column(Text, nullable=True)
    booked_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments_as_patient")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="appointments_as_doctor")

    __table_args__ = (
        UniqueConstraint("doctor_name", "appointment_datetime", name="uq_doctor_slot"),
    )


class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prediction = Column(String, nullable=False)        # "cancer" | "normal"
    confidence = Column(Float, nullable=True)
    symptom_type = Column(String, nullable=True)       # "1" | "2" | "3" if normal + user picked
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("User", back_populates="scan_results")
