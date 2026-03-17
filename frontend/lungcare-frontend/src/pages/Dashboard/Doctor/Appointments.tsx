import React, { useEffect, useState, useMemo } from "react";
import DoctorLayout from "../../../components/DoctorLayout";
import { getMyAppointments, confirmAppointment, cancelAppointment } from "../../../api/appointments";
import type { AppointmentOut } from "../../../api/appointments";

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("upcoming");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getMyAppointments()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return appointments.filter((a) => {
      const dt = new Date(a.appointment_datetime);
      if (filter === "upcoming") return dt >= now && a.status !== "cancelled";
      if (filter === "completed") return a.status === "confirmed" && dt < now;
      if (filter === "cancelled") return a.status === "cancelled";
      return true;
    });
  }, [appointments, filter]);

  const handleConfirm = async (id: number) => {
    try {
      await confirmAppointment(id);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "confirmed" } : a));
      showToast("Appointment confirmed ✓");
    } catch {
      showToast("Failed to confirm appointment", "err");
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelAppointment(id);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled" } : a));
      showToast("Appointment cancelled");
    } catch {
      showToast("Failed to cancel appointment", "err");
    }
  };

  const statusStyle: Record<string, { bg: string; text: string; border: string }> = {
    pending:   { bg: "rgba(59,130,246,0.15)",  text: "#93c5fd",  border: "rgba(59,130,246,0.3)" },
    confirmed: { bg: "rgba(34,197,94,0.15)",   text: "#86efac",  border: "rgba(34,197,94,0.3)" },
    cancelled: { bg: "rgba(239,68,68,0.15)",   text: "#fca5a5",  border: "rgba(239,68,68,0.3)" },
  };

  return (
    <DoctorLayout>
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "14px 22px", borderRadius: 12, background: toast.type === "ok" ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)", color: "#fff", fontSize: 14, fontWeight: 600, backdropFilter: "blur(10px)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
          {toast.type === "ok" ? "✓ " : "⚠ "}{toast.msg}
        </div>
      )}

      <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#22c55e,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📅</div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, background: "linear-gradient(135deg,#fff,#86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Appointments</h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0" }}>{appointments.length} total appointments</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, background: "rgba(15,23,42,0.8)", padding: 4, borderRadius: 12, marginBottom: 24, border: "1px solid rgba(30,41,59,0.5)", width: "fit-content" }}>
          {(["upcoming", "all", "completed", "cancelled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: filter === f ? "rgba(99,102,241,0.25)" : "transparent", color: filter === f ? "#a5b4fc" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize", transition: "all 0.2s" }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div style={{ width: 36, height: 36, border: "3px solid rgba(34,197,94,0.2)", borderTopColor: "#22c55e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: 15 }}>No {filter} appointments.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filtered.map((apt) => {
              const dt = new Date(apt.appointment_datetime);
              const ss = statusStyle[apt.status] || statusStyle["pending"];
              const isPast = dt < new Date();
              return (
                <div key={apt.id} style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(10px)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16, padding: 22, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1 }}>
                    {/* Date block */}
                    <div style={{ minWidth: 56, height: 56, borderRadius: 14, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#a5b4fc" }}>{dt.getDate()}</div>
                      <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>{dt.toLocaleString("default", { month: "short" })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{apt.patient_name}</div>
                      <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>
                        🕐 {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {apt.mode === "virtual" ? "🎥 Virtual" : "🏥 In-person"}
                      </div>
                      {apt.notes && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>📝 {apt.notes}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: ss.bg, color: ss.text, border: `1px solid ${ss.border}`, textTransform: "capitalize" }}>
                      {apt.status}
                    </span>
                    {apt.status === "pending" && !isPast && (
                      <>
                        <button onClick={() => handleConfirm(apt.id)}
                          style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)", color: "#86efac", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(34,197,94,0.2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(34,197,94,0.1)"}>
                          ✓ Confirm
                        </button>
                        <button onClick={() => handleCancel(apt.id)}
                          style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#fca5a5", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}>
                          ✕ Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default AppointmentsPage;
