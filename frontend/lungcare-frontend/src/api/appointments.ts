import api from "./client";

export interface AppointmentOut {
  id: number;
  doctor_name: string;
  doctor_slug: string | null;
  appointment_datetime: string;
  mode: string;
  status: string;
  notes: string | null;
  booked_at: string;
  doctor_specialization?: string;
  doctor_hospital?: string;
  doctor_city?: string;
  patient_name?: string;
}

export const bookAppointment = async (
  doctor_slug: string,
  appointment_datetime: string,
  mode: string,
  notes?: string
): Promise<AppointmentOut> => {
  const res = await api.post<AppointmentOut>("/appointments/", {
    doctor_slug,
    appointment_datetime,
    mode,
    notes,
  });
  return res.data;
};

export const getMyAppointments = async (): Promise<AppointmentOut[]> => {
  const res = await api.get<AppointmentOut[]>("/appointments/mine");
  return res.data;
};

export const cancelAppointment = async (id: number): Promise<void> => {
  await api.delete(`/appointments/${id}`);
};

export const confirmAppointment = async (id: number): Promise<AppointmentOut> => {
  const res = await api.patch<AppointmentOut>(`/appointments/${id}/confirm`);
  return res.data;
};
