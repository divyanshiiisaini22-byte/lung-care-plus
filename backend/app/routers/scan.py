import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ScanResult
from ..schemas import ScanPredictOut, ScanResultOut, SymptomRecommendRequest, SymptomRecommendOut, DoctorMiniOut
from ..core.deps import require_patient
from ..ml.cancer_net import predict_image
from ..data.doctors import SYMPTOM_DOCTORS, SYMPTOM_LABELS, SYMPTOM_OPTIONS

router = APIRouter(prefix="/scan", tags=["scan"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _get_doctors_for_keys(keys: list[str], db: Session) -> list[DoctorMiniOut]:
    from ..routers.doctors import _serialize_doctor
    result = []
    for slug in keys:
        doc = db.query(User).filter(User.slug == slug, User.role == "doctor").first()
        if doc:
            result.append(DoctorMiniOut(**_serialize_doctor(doc)))
    return result


@router.post("/predict", response_model=ScanPredictOut)
async def predict(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG images are accepted")

    raw = await image.read()
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large (max 10 MB)")

    try:
        result = predict_image(raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    prediction = result["prediction"]
    confidence = result["confidence"]

    # Persist the scan result
    scan = ScanResult(
        patient_id=current_user.id,
        prediction=prediction,
        confidence=confidence,
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    if prediction == "cancer":
        doctors = _get_doctors_for_keys(SYMPTOM_DOCTORS["cancer"], db)
        return ScanPredictOut(
            scan_id=scan.id,
            prediction="cancer",
            confidence=confidence,
            message="⚠️ Our model detected signs of potential lung cancer. Please consult a specialist as soon as possible.",
            doctors=doctors,
            symptom_options=None,
        )
    else:
        return ScanPredictOut(
            scan_id=scan.id,
            prediction="normal",
            confidence=confidence,
            message="✅ No cancer indicators detected. Do you have any other symptoms?",
            doctors=None,
            symptom_options=SYMPTOM_OPTIONS,
        )


@router.post("/recommend-doctors", response_model=SymptomRecommendOut)
def recommend_doctors(
    body: SymptomRecommendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    if body.symptom_choice not in ("1", "2", "3"):
        raise HTTPException(status_code=400, detail="symptom_choice must be 1, 2, or 3")

    # Update the scan result with the selected symptom
    scan = db.query(ScanResult).filter(
        ScanResult.id == body.scan_id,
        ScanResult.patient_id == current_user.id,
    ).first()
    if scan:
        scan.symptom_type = body.symptom_choice
        db.commit()

    doctors = _get_doctors_for_keys(SYMPTOM_DOCTORS[body.symptom_choice], db)
    return SymptomRecommendOut(
        illness=SYMPTOM_LABELS[body.symptom_choice],
        doctors=doctors,
    )


@router.get("/history", response_model=list[ScanResultOut])
def scan_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
):
    scans = (
        db.query(ScanResult)
        .filter(ScanResult.patient_id == current_user.id)
        .order_by(ScanResult.created_at.desc())
        .all()
    )
    return [ScanResultOut.model_validate(s) for s in scans]
