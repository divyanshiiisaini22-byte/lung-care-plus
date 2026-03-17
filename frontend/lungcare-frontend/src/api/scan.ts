import api from "./client";

export interface DoctorMini {
  id: number;
  full_name: string;
  slug: string;
  specialization: string;
  hospital_name: string;
  city: string;
  rating: number;
  consultation_fee: number;
  accepts_virtual: boolean;
}

export interface ScanPredictResult {
  scan_id: number;
  prediction: "cancer" | "normal";
  confidence: number;
  message: string;
  doctors?: DoctorMini[];
  symptom_options?: Record<string, string>;
}

export interface SymptomRecommendResult {
  illness: string;
  doctors: DoctorMini[];
}

export interface ScanHistoryItem {
  id: number;
  prediction: string;
  confidence: number | null;
  symptom_type: string | null;
  created_at: string;
}

export const predictScan = async (imageFile: File): Promise<ScanPredictResult> => {
  const form = new FormData();
  form.append("image", imageFile);
  const res = await api.post<ScanPredictResult>("/scan/predict", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const recommendDoctors = async (
  scan_id: number,
  symptom_choice: string
): Promise<SymptomRecommendResult> => {
  const res = await api.post<SymptomRecommendResult>("/scan/recommend-doctors", {
    scan_id,
    symptom_choice,
  });
  return res.data;
};

export const getScanHistory = async (): Promise<ScanHistoryItem[]> => {
  const res = await api.get<ScanHistoryItem[]>("/scan/history");
  return res.data;
};
