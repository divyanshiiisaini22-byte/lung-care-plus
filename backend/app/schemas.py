from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, EmailStr


# ═══════════════════════════════════════════════════════════════ AUTH ══════
class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str    # "doctor" | "patient"
    age: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    age: Optional[int] = None
    # doctor extras
    slug: Optional[str] = None
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════ DOCTORS ══
class DoctorOut(BaseModel):
    id: int
    full_name: str
    email: str
    slug: str
    specialization: str
    experience_years: int
    hospital_name: str
    bio: str
    rating: float
    review_count: int
    is_available: bool
    consultation_fee: float
    city: str
    country: str
    phone: Optional[str] = None
    consulting_hours: Optional[str] = None
    about: Optional[str] = None
    languages: Optional[List[str]] = None
    badges: Optional[List[str]] = None
    accepts_virtual: bool
    next_available: Optional[str] = None

    class Config:
        from_attributes = True


class SlotOut(BaseModel):
    datetime_iso: str
    time_label: str
    available: bool


class DoctorDetailOut(DoctorOut):
    slots: List[SlotOut] = []


# ═══════════════════════════════════════════════════════════════ SCAN ═════
class ScanPredictOut(BaseModel):
    scan_id: int
    prediction: str          # "cancer" | "normal"
    confidence: float
    message: str
    doctors: Optional[List["DoctorMiniOut"]] = None          # cancer case
    symptom_options: Optional[dict] = None                   # normal case


class SymptomRecommendRequest(BaseModel):
    scan_id: int
    symptom_choice: str      # "1" | "2" | "3"


class SymptomRecommendOut(BaseModel):
    illness: str
    doctors: List["DoctorMiniOut"]


class ScanResultOut(BaseModel):
    id: int
    prediction: str
    confidence: Optional[float]
    symptom_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DoctorMiniOut(BaseModel):
    id: int
    full_name: str
    slug: str
    specialization: str
    hospital_name: str
    city: str
    rating: float
    consultation_fee: float
    accepts_virtual: bool

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════ APPOINTMENTS ══
class BookAppointmentRequest(BaseModel):
    doctor_slug: str
    appointment_datetime: datetime
    mode: str = "Virtual"
    notes: Optional[str] = None


class AppointmentOut(BaseModel):
    id: int
    doctor_name: str
    doctor_slug: Optional[str]
    appointment_datetime: datetime
    mode: str
    status: str
    notes: Optional[str]
    booked_at: datetime
    # extras hydrated in router
    doctor_specialization: Optional[str] = None
    doctor_hospital: Optional[str] = None
    doctor_city: Optional[str] = None
    patient_name: Optional[str] = None

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════════════════════ DASHBOARD ══
class DashboardStats(BaseModel):
    total_patients: int
    high_risk: int
    medium_risk: int
    low_risk: int
    recent_scans_7d: int
    today_appointments: int
    pending_appointments: int   # repurposed: "my upcoming appointments"


class PatientListItem(BaseModel):
    id: int
    full_name: str
    email: str
    age: Optional[int]
    last_scan_date: Optional[datetime]
    last_scan_result: Optional[str]
    risk: str
    scan_count: int

    class Config:
        from_attributes = True


class PatientDetail(BaseModel):
    id: int
    full_name: str
    email: str
    age: Optional[int]
    risk: str
    scan_results: List[ScanResultOut]
    appointments: List[AppointmentOut]

    class Config:
        from_attributes = True


class RiskDistribution(BaseModel):
    high: int
    medium: int
    low: int


class AnalyticsOut(BaseModel):
    total_scans: int
    cancer_count: int
    normal_count: int
    cancer_rate: float
    scans_per_week: List[Dict]        # [{week, count}]
    symptom_breakdown: Dict           # {"1": n, "2": n, "3": n}
    total_appointments: int
    appointment_status_breakdown: Dict
    # Enhanced fields for richer charts
    risk_distribution: Optional[RiskDistribution] = None
    age_distribution: Optional[Dict[str, int]] = None
    total_patients: Optional[int] = None
