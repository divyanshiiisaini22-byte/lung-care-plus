import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import PatientLayout from "../../../components/PatientLayout";
import { getScanHistory, type ScanHistoryItem } from "../../../api/scan";
import { getMyAppointments, type AppointmentOut } from "../../../api/appointments";

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([getScanHistory(), getMyAppointments()]);
        setScans(s);
        setAppointments(a.filter((x) => x.status !== "cancelled"));
      } catch {
        // tolerate error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const lastScan = scans[0];
  const upcomingAppts = appointments.filter((a) => new Date(a.appointment_datetime) > new Date());
  const riskLabel = lastScan
    ? lastScan.prediction === "cancer" ? "High" : "Low"
    : "Unknown";
  const riskColor = riskLabel === "High" ? "#ef4444" : riskLabel === "Low" ? "#22c55e" : "#94a3b8";

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <PatientLayout>
      <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#fff,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Welcome, {user?.full_name?.split(" ")[0] || "Patient"} 👋
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Scans", value: loading ? "…" : String(scans.length), icon: "🔬", color: "#3b82f6", sub: "CT scan analyses done" },
            { label: "Risk Level", value: loading ? "…" : riskLabel, icon: riskLabel === "High" ? "🔴" : riskLabel === "Low" ? "🟢" : "⚪", color: riskColor, sub: "Based on last scan" },
            { label: "Appointments", value: loading ? "…" : String(upcomingAppts.length), icon: "📅", color: "#8b5cf6", sub: "Upcoming" },
          ].map((s) => (
            <div key={s.label} style={{ padding: 20, borderRadius: 16, background: "rgba(15,23,42,0.8)", border: `1px solid rgba(${s.color === "#3b82f6" ? "59,130,246" : s.color === "#8b5cf6" ? "139,92,246" : s.color === "#ef4444" ? "239,68,68" : s.color === "#22c55e" ? "34,197,94" : "148,163,184"},0.2)`, backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
          {[
            { label: "Upload CT Scan", detail: "Get AI analysis instantly", icon: "🫁", path: "/patient/scan", gradient: "linear-gradient(135deg,#3b82f6,#06b6d4)" },
            { label: "Find Doctors", detail: "Browse lung specialists", icon: "👨‍⚕️", path: "/patient/doctors", gradient: "linear-gradient(135deg,#8b5cf6,#ec4899)" },
            { label: "My Appointments", detail: "View & manage bookings", icon: "📅", path: "/patient/appointments", gradient: "linear-gradient(135deg,#10b981,#06b6d4)" },
          ].map((a) => (
            <button key={a.path} onClick={() => navigate(a.path)}
              style={{ padding: "20px 18px", borderRadius: 16, border: "none", background: "rgba(15,23,42,0.7)", cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "grid", gap: 8, backdropFilter: "blur(10px)", border2: "1px solid rgba(148,163,184,0.12)" } as React.CSSProperties}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: a.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{a.label}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{a.detail}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Scan history */}
          <div style={{ padding: 24, borderRadius: 16, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.5)", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🔬 Recent Scans</h2>
              <button onClick={() => navigate("/patient/scan")}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)", color: "#93c5fd", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                New Scan +
              </button>
            </div>
            {loading ? (
              <div style={{ color: "#64748b", fontSize: 13 }}>Loading…</div>
            ) : scans.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0", color: "#64748b" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔬</div>
                <div style={{ fontSize: 13 }}>No scans yet</div>
                <button onClick={() => navigate("/patient/scan")}
                  style={{ marginTop: 12, padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)", color: "#93c5fd", fontSize: 12, cursor: "pointer" }}>
                  Upload first scan →
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {scans.slice(0, 4).map((s) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, background: s.prediction === "cancer" ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.06)", border: `1px solid ${s.prediction === "cancer" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: s.prediction === "cancer" ? "#fca5a5" : "#86efac" }}>
                        {s.prediction === "cancer" ? "⚠️ Cancer Signs" : "✅ Normal"}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{fmtDate(s.created_at)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      {s.confidence ? `${s.confidence.toFixed(0)}% conf.` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming appointments */}
          <div style={{ padding: 24, borderRadius: 16, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.5)", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>📅 Upcoming Appointments</h2>
              <button onClick={() => navigate("/patient/appointments")}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.1)", color: "#c4b5fd", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                View All →
              </button>
            </div>
            {loading ? (
              <div style={{ color: "#64748b", fontSize: 13 }}>Loading…</div>
            ) : upcomingAppts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0", color: "#64748b" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                <div style={{ fontSize: 13 }}>No upcoming appointments</div>
                <button onClick={() => navigate("/patient/doctors")}
                  style={{ marginTop: 12, padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.1)", color: "#c4b5fd", fontSize: 12, cursor: "pointer" }}>
                  Find a doctor →
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {upcomingAppts.slice(0, 4).map((a) => (
                  <div key={a.id} style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>🩺 {a.doctor_name}</div>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: a.status === "confirmed" ? "rgba(34,197,94,0.15)" : "rgba(251,191,36,0.15)", color: a.status === "confirmed" ? "#86efac" : "#fcd34d", border: `1px solid ${a.status === "confirmed" ? "rgba(34,197,94,0.25)" : "rgba(251,191,36,0.25)"}` }}>
                        {a.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                      {fmtDate(a.appointment_datetime)} · {fmtTime(a.appointment_datetime)} · {a.mode}
                    </div>
                    {a.doctor_specialization && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{a.doctor_specialization}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;
