import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import DoctorLayout from "../../../components/DoctorLayout";
import { getDashboardStats, getPatientsList } from "../../../api/dashboard";
import type { DashboardStats, PatientListItem } from "../../../api/dashboard";

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getPatientsList()])
      .then(([s, p]) => { setStats(s); setPatients(p.slice(0, 5)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const riskColors: Record<string, { bg: string; border: string; text: string }> = {
    High:   { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.3)",  text: "#fca5a5" },
    Medium: { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", text: "#fcd34d" },
    Low:    { bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.3)",  text: "#86efac" },
  };

  const riskDist = stats ? [
    { label: "High",   value: stats.high_risk,   color: "#ef4444", pct: stats.total_patients ? (stats.high_risk   / stats.total_patients) * 100 : 0 },
    { label: "Medium", value: stats.medium_risk, color: "#fbbf24", pct: stats.total_patients ? (stats.medium_risk / stats.total_patients) * 100 : 0 },
    { label: "Low",    value: stats.low_risk,    color: "#22c55e", pct: stats.total_patients ? (stats.low_risk    / stats.total_patients) * 100 : 0 },
  ] : [];

  const getRelativeTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff}d ago`;
    return `${Math.floor(diff / 7)}w ago`;
  };

  return (
    <DoctorLayout>
      <div style={{ padding: "32px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 400, background: "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.1), transparent 50%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📊</div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, background: "linear-gradient(135deg,#fff,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Dashboard Overview
              </h1>
              <p style={{ fontSize: 14, color: "#94a3b8", margin: "4px 0 0" }}>
                Welcome back, Dr. {user?.full_name || "Doctor"} · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
              <div style={{ width: 40, height: 40, border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                {[
                  { label: "Total Patients", value: stats?.total_patients ?? 0, icon: "👥", color: "#3b82f6", rgb: "59,130,246", sub: "enrolled" },
                  { label: "High Risk Cases", value: stats?.high_risk ?? 0, icon: "🔴", color: "#ef4444", rgb: "239,68,68", sub: "critical" },
                  { label: "Scans This Month", value: stats?.scans_this_month ?? 0, icon: "📸", color: "#8b5cf6", rgb: "139,92,246", sub: "analyzed" },
                  { label: "Upcoming Appts", value: stats?.upcoming_appointments ?? 0, icon: "📅", color: "#22c55e", rgb: "34,197,94", sub: "scheduled" },
                ].map((s) => (
                  <div key={s.label}
                    style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)", border: `1px solid rgba(${s.rgb},0.2)`, borderRadius: 16, padding: 20, transition: "all 0.3s", cursor: "default" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(${s.rgb},0.2)`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 28 }}>{s.icon}</span>
                      <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 8, background: `rgba(${s.rgb},0.2)`, color: s.color, fontWeight: 600 }}>{s.sub}</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 700, background: `linear-gradient(135deg,${s.color},${s.color}cc)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
                <div style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16, padding: 24 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#e2e8f0" }}>Risk Distribution</h2>
                  {riskDist.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {riskDist.map((item) => (
                        <div key={item.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 14, color: "#cbd5e1", fontWeight: 500 }}>{item.label} Risk</span>
                            <span style={{ fontSize: 14, color: item.color, fontWeight: 600 }}>{item.value} ({item.pct.toFixed(0)}%)</span>
                          </div>
                          <div style={{ width: "100%", height: 12, borderRadius: 6, background: "rgba(30,41,59,0.5)", overflow: "hidden" }}>
                            <div style={{ width: `${item.pct}%`, height: "100%", background: `linear-gradient(90deg,${item.color},${item.color}bb)`, borderRadius: 6 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 24 }}>No patient data yet.</p>
                  )}
                </div>

                <div style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16, padding: 24 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#e2e8f0" }}>Quick Actions</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    {[
                      { label: "View All Patients", icon: "👥", path: "/dashboard/doctor/patients", rgb: "59,130,246", tc: "#93c5fd" },
                      { label: "Analytics & Insights", icon: "📈", path: "/dashboard/doctor/analytics", rgb: "139,92,246", tc: "#c4b5fd" },
                      { label: "Manage Appointments", icon: "📅", path: "/dashboard/doctor/appointments", rgb: "34,197,94", tc: "#86efac" },
                      { label: "Notifications", icon: "🔔", path: "/dashboard/doctor/notifications", rgb: "249,115,22", tc: "#fdba74" },
                    ].map((a) => (
                      <button key={a.path} onClick={() => navigate(a.path)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, border: `1px solid rgba(${a.rgb},0.3)`, background: `rgba(${a.rgb},0.1)`, color: a.tc, cursor: "pointer", fontSize: 14, fontWeight: 500, textAlign: "left", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.background = `rgba(${a.rgb},0.2)`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = `rgba(${a.rgb},0.1)`; }}>
                        <span style={{ fontSize: 20 }}>{a.icon}</span>
                        <span style={{ flex: 1 }}>{a.label}</span>
                        <span style={{ fontSize: 12 }}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Patients */}
              <div style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0" }}>Recent Patients</h2>
                  <button onClick={() => navigate("/dashboard/doctor/patients")}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)", color: "#93c5fd", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.1)"}>
                    View All →
                  </button>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {patients.length === 0 && <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 24 }}>No patients yet. They'll appear here after booking appointments.</p>}
                  {patients.map((p) => {
                    const rc = riskColors[p.risk_level] || riskColors["Low"];
                    return (
                      <div key={p.id} onClick={() => navigate(`/dashboard/doctor/patients/${p.id}`)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 12, background: rc.bg, border: `1px solid ${rc.border}`, cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: "#94a3b8" }}>
                              {p.age ? `Age ${p.age} · ` : ""}{p.last_scan_date ? `Last scan: ${getRelativeTime(p.last_scan_date)}` : "No scans yet"}
                            </div>
                          </div>
                        </div>
                        <span style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>{p.risk_level}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
