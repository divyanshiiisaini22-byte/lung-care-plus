import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DoctorLayout from "../../../components/DoctorLayout";
import { getPatientDetail } from "../../../api/dashboard";
import type { PatientDetail } from "../../../api/dashboard";

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "scans" | "appointments">("overview");

  useEffect(() => {
    if (!id) return;
    getPatientDetail(Number(id))
      .then(setPatient)
      .catch(() => setError("Patient not found or you don't have access."))
      .finally(() => setLoading(false));
  }, [id]);

  const riskColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    High:   { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.3)",  text: "#fca5a5",  glow: "rgba(239,68,68,0.2)" },
    Medium: { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", text: "#fcd34d",  glow: "rgba(251,191,36,0.2)" },
    Low:    { bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.3)",  text: "#86efac",  glow: "rgba(34,197,94,0.2)" },
  };

  return (
    <DoctorLayout>
      <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Back button */}
        <button onClick={() => navigate("/dashboard/doctor/patients")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(30,41,59,0.5)", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 14, marginBottom: 24, fontWeight: 500 }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#e2e8f0"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>
          ← Back to Patients
        </button>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <div style={{ width: 36, height: 36, border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 60, color: "#f87171" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <p>{error}</p>
          </div>
        ) : patient ? (() => {
          const rc = riskColors[patient.risk_level] || riskColors["Low"];
          return (
            <>
              {/* Patient Header Card */}
              <div style={{ background: "rgba(15,23,42,0.9)", backdropFilter: "blur(12px)", border: `1px solid ${rc.border}`, borderRadius: 20, padding: 28, marginBottom: 24, boxShadow: `0 8px 32px ${rc.glow}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 18, background: `linear-gradient(135deg, ${rc.bg}, rgba(15,23,42,0.9))`, border: `2px solid ${rc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>👤</div>
                    <div>
                      <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#f1f5f9" }}>{patient.name}</h1>
                      <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>📧 {patient.email}</span>
                        {patient.age && <span style={{ fontSize: 13, color: "#94a3b8" }}>🎂 Age {patient.age}</span>}
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>🗓 Joined {new Date(patient.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ padding: "8px 20px", borderRadius: 24, fontSize: 14, fontWeight: 700, background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>{patient.risk_level} Risk</span>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Total Scans", value: patient.total_scans, icon: "📸", color: "#8b5cf6" },
                  { label: "Cancer Detected", value: patient.cancer_scans, icon: "🔴", color: "#ef4444" },
                  { label: "Total Appointments", value: patient.appointments.length, icon: "📅", color: "#22c55e" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 14, padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 4, background: "rgba(15,23,42,0.8)", padding: 4, borderRadius: 12, marginBottom: 20, width: "fit-content", border: "1px solid rgba(30,41,59,0.5)" }}>
                {(["overview", "scans", "appointments"] as const).map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: activeTab === t ? "rgba(99,102,241,0.25)" : "transparent", color: activeTab === t ? "#a5b4fc" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s" }}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "overview" && (
                <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>Patient Overview</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[
                      { label: "Full Name", value: patient.name },
                      { label: "Email", value: patient.email },
                      { label: "Age", value: patient.age ? `${patient.age} years` : "Not provided" },
                      { label: "Risk Level", value: patient.risk_level },
                      { label: "Total CT Scans", value: `${patient.total_scans} scans` },
                      { label: "Cancer Positives", value: `${patient.cancer_scans} detected` },
                    ].map((item) => (
                      <div key={item.label} style={{ padding: 16, background: "rgba(30,41,59,0.3)", borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{item.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "scans" && (
                <div style={{ display: "grid", gap: 14 }}>
                  {patient.recent_scans.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "#64748b", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16 }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                      <p>No CT scans uploaded yet.</p>
                    </div>
                  ) : patient.recent_scans.map((scan) => {
                    const isCancer = scan.prediction === "cancer";
                    const sc = isCancer
                      ? { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)", text: "#fca5a5", label: "Cancer Detected" }
                      : { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)", text: "#86efac", label: "Normal" };
                    return (
                      <div key={scan.id} style={{ background: "rgba(15,23,42,0.8)", border: `1px solid ${sc.border}`, borderRadius: 14, padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: sc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                              {isCancer ? "⚠️" : "✅"}
                            </div>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: sc.text }}>{sc.label}</div>
                              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                                {new Date(scan.created_at).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: sc.text }}>{((scan.confidence ?? 0) * 100).toFixed(1)}%</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>confidence</div>
                          </div>
                        </div>
                        {scan.symptom_type && (
                          <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", fontSize: 13, color: "#c4b5fd" }}>
                            Symptom reported: <strong>{scan.symptom_type}</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "appointments" && (
                <div style={{ display: "grid", gap: 14 }}>
                  {patient.appointments.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "#64748b", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16 }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
                      <p>No appointments booked yet.</p>
                    </div>
                  ) : patient.appointments.map((apt) => {
                    const statusColors: Record<string, { bg: string; text: string }> = {
                      confirmed: { bg: "rgba(34,197,94,0.2)", text: "#86efac" },
                      pending:   { bg: "rgba(59,130,246,0.2)", text: "#93c5fd" },
                      cancelled: { bg: "rgba(239,68,68,0.2)", text: "#fca5a5" },
                    };
                    const sc2 = statusColors[apt.status] || statusColors["pending"];
                    return (
                      <div key={apt.id} style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 14, padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📅</div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{new Date(apt.appointment_datetime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>
                              {new Date(apt.appointment_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {apt.mode === "virtual" ? "🎥 Virtual" : "🏥 In-person"}
                            </div>
                            {apt.notes && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Note: {apt.notes}</div>}
                          </div>
                        </div>
                        <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc2.bg, color: sc2.text, border: `1px solid ${sc2.text}44`, textTransform: "capitalize" }}>{apt.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })() : null}
      </div>
    </DoctorLayout>
  );
};

export default PatientDetailPage;
