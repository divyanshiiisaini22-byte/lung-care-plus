import api from "./client";
import type { AppointmentOut } from "./appointments";

export interface DashboardStats {
  total_patients: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  recent_scans_7d: number;
  today_appointments: number;
  pending_appointments: number;
  // Convenience aliases populated by normalizer
  scans_this_month: number;
  upcoming_appointments: number;
}

export interface PatientListItem {
  id: number;
  full_name: string;
  email: string;
  age: number | null;
  last_scan_date: string | null;
  last_scan_result: string | null;
  risk: "High" | "Medium" | "Low";
  scan_count: number;
  // Normalized aliases
  name: string;
  risk_level: "High" | "Medium" | "Low";
}

export interface ScanResultOut {
  id: number;
  prediction: string;
  confidence: number | null;
  symptom_type: string | null;
  created_at: string;
}

export interface PatientDetail {
  id: number;
  full_name: string;
  email: string;
  age: number | null;
  risk: string;
  scan_results: ScanResultOut[];
  appointments: AppointmentOut[];
  // Normalized aliases
  name: string;
  risk_level: string;
  recent_scans: ScanResultOut[];
  total_scans: number;
  cancer_scans: number;
  created_at: string;
}

export interface AnalyticsOut {
  total_scans: number;
  cancer_count: number;
  normal_count: number;
  cancer_rate: number;
  scans_per_week: { week: string; count: number }[];
  symptom_breakdown: Record<string, number>;
  total_appointments: number;
  appointment_status_breakdown: Record<string, number>;
  // Normalized
  total_patients: number;
  cancer_cases: number;
  normal_cases: number;
  risk_distribution: { high: number; medium: number; low: number };
  age_distribution: Record<string, number>;
  scan_trend: { month: string; count: number }[];
}

// --- Normalizers to handle field name mismatches between backend & pages ---

function normalizeStats(s: Omit<DashboardStats, "scans_this_month" | "upcoming_appointments">): DashboardStats {
  return { ...s, scans_this_month: s.recent_scans_7d, upcoming_appointments: s.pending_appointments } as DashboardStats;
}

function normalizePatient(p: Omit<PatientListItem, "name" | "risk_level">): PatientListItem {
  const base = p as PatientListItem;
  return { ...base, name: base.full_name, risk_level: base.risk };
}

function normalizeDetail(p: Omit<PatientDetail, "name" | "risk_level" | "recent_scans" | "total_scans" | "cancer_scans" | "created_at">): PatientDetail {
  const base = p as PatientDetail;
  return {
    ...base,
    name: base.full_name,
    risk_level: base.risk,
    recent_scans: base.scan_results,
    total_scans: base.scan_results?.length ?? 0,
    cancer_scans: base.scan_results?.filter((s) => s.prediction === "cancer").length ?? 0,
    created_at: base.created_at ?? new Date().toISOString(),
  };
}

function normalizeAnalytics(a: Omit<AnalyticsOut, "cancer_cases" | "normal_cases" | "total_patients" | "risk_distribution" | "age_distribution" | "scan_trend">): AnalyticsOut {
  const base = a as AnalyticsOut;
  return {
    ...base,
    cancer_cases: base.cancer_count,
    normal_cases: base.normal_count,
    total_patients: base.total_patients ?? 0,
    risk_distribution: base.risk_distribution ?? { high: 0, medium: 0, low: 0 },
    age_distribution: base.age_distribution ?? {},
    scan_trend: base.scan_trend ?? base.scans_per_week.map((s) => ({ month: s.week, count: s.count })),
  };
}

// --- API functions ---

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get<DashboardStats>("/dashboard/stats");
  return normalizeStats(res.data);
};

export const getPatientsList = async (): Promise<PatientListItem[]> => {
  const res = await api.get<PatientListItem[]>("/dashboard/patients");
  return res.data.map(normalizePatient);
};

export const getPatientDetail = async (id: number): Promise<PatientDetail> => {
  const res = await api.get<PatientDetail>(`/dashboard/patients/${id}`);
  return normalizeDetail(res.data);
};

export const getAnalytics = async (): Promise<AnalyticsOut> => {
  const res = await api.get<AnalyticsOut>("/dashboard/analytics");
  return normalizeAnalytics(res.data);
};
