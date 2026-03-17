import api from "./client";

export interface Doctor {
  id: number;
  full_name: string;
  email: string;
  slug: string;
  specialization: string;
  experience_years: number;
  hospital_name: string;
  bio: string;
  rating: number;
  review_count: number;
  is_available: boolean;
  consultation_fee: number;
  city: string;
  country: string;
  phone?: string;
  consulting_hours?: string;
  about?: string;
  languages?: string[];
  badges?: string[];
  accepts_virtual: boolean;
  next_available?: string;
}

export interface SlotOut {
  datetime_iso: string;
  time_label: string;
  available: boolean;
}

export interface DoctorDetail extends Doctor {
  slots: SlotOut[];
}

export const getDoctors = async (): Promise<Doctor[]> => {
  const res = await api.get<Doctor[]>("/doctors/");
  return res.data;
};

export const getDoctorDetail = async (slug: string): Promise<DoctorDetail> => {
  const res = await api.get<DoctorDetail>(`/doctors/${slug}`);
  return res.data;
};
