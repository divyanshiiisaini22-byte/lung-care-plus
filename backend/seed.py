"""
Run once to seed the database with demo doctors and patients.
  python seed.py
"""
import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models import User, ScanResult, Appointment
from app.core.security import hash_password
from app.data.doctors import DOCTORS_SEED
from datetime import datetime, timedelta, timezone

Base.metadata.create_all(bind=engine)
IST = timezone(timedelta(hours=5, minutes=30))  # UTC+5:30, no tzdata needed


def seed():
    db = SessionLocal()
    try:
        # ── Doctors ──────────────────────────────────────────────────────────
        for d in DOCTORS_SEED:
            if db.query(User).filter(User.email == d["email"]).first():
                print(f"  Skip (exists): {d['email']}")
                continue
            user = User(
                email=d["email"],
                hashed_password=hash_password(d["password"]),
                full_name=d["full_name"],
                role="doctor",
                slug=d["slug"],
                specialization=d["specialization"],
                experience_years=d["experience_years"],
                hospital_name=d["hospital_name"],
                bio=d["bio"],
                about=d["about"],
                rating=d["rating"],
                review_count=d["review_count"],
                is_available=d["is_available"],
                consultation_fee=d["consultation_fee"],
                city=d["city"],
                country=d["country"],
                phone=d["phone"],
                consulting_hours=d["consulting_hours"],
                languages=json.dumps(d["languages"]),
                badges=json.dumps(d["badges"]),
                accepts_virtual=d["accepts_virtual"],
                next_available=d["next_available"],
            )
            db.add(user)
            print(f"  Created doctor: {d['full_name']}")

        db.commit()

        # ── Demo patients ─────────────────────────────────────────────────────
        demo_patients = [
            {
                "email": "patient@lungcare.com",
                "password": "Patient@123",
                "full_name": "Demo Patient",
                "age": 35,
            },
            {
                "email": "rahul.singh@example.com",
                "password": "Patient@123",
                "full_name": "Rahul Singh",
                "age": 45,
            },
            {
                "email": "anjali.gupta@example.com",
                "password": "Patient@123",
                "full_name": "Anjali Gupta",
                "age": 32,
            },
            {
                "email": "vikram.patel@example.com",
                "password": "Patient@123",
                "full_name": "Vikram Patel",
                "age": 55,
            },
        ]

        for p in demo_patients:
            if db.query(User).filter(User.email == p["email"]).first():
                print(f"  Skip (exists): {p['email']}")
                continue
            user = User(
                email=p["email"],
                hashed_password=hash_password(p["password"]),
                full_name=p["full_name"],
                role="patient",
                age=p["age"],
            )
            db.add(user)
            print(f"  Created patient: {p['full_name']}")

        db.commit()

        # ── Demo scan results ─────────────────────────────────────────────────
        patients = db.query(User).filter(User.role == "patient").all()
        demo_scans = [
            ("cancer", 87.5, None),
            ("normal", 92.1, "2"),
            ("normal", 88.3, "1"),
            ("cancer", 79.4, None),
        ]
        for i, patient in enumerate(patients):
            if patient.scan_results:
                continue
            pred, conf, symp = demo_scans[i % len(demo_scans)]
            scan = ScanResult(
                patient_id=patient.id,
                prediction=pred,
                confidence=conf,
                symptom_type=symp,
                created_at=datetime.utcnow() - timedelta(days=i * 3 + 1),
            )
            db.add(scan)
            print(f"  Added scan for: {patient.full_name} → {pred}")

        db.commit()

        print("\n✅ Database seeded successfully!")
        print("\nDemo accounts:")
        print("  Doctor:  alice.brown@lungcare.com  /  Doctor@123")
        print("  Patient: patient@lungcare.com      /  Patient@123")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
