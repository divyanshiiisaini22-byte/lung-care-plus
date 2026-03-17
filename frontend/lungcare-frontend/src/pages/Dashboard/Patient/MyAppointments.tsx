import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../../components/PatientLayout";
import { getMyAppointments, cancelAppointment, type AppointmentOut } from "../../../api/appointments";

const MyAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getMyAppointments();
      setAppointments(data.sort((a, b) => new Date(b.appointment_datetime).getTime() - new Date(a.appointment_datetime).getTime()));
    } catch {
      // tolerate
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id: number) => {
    setCancelling(id);
    try {
      await cancelAppointment(id);
      setToast("Appointment cancelled");
      setTimeout(() => setToast(null), 2500);
      await load();
    } catch {
      setToast("Could not cancel — try again");
      setTimeout(() => setToast(null), 2500);
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = appointments.filter((a) => new Date(a.appointment_datetime) > new Date() && a.status !== "cancelled");
  const past = appointments.filter((a) => new Date(a.appointment_datetime) <= new Date() || a.status === "cancelled");

  const fmtDT = (d: string) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const CARD = ({ a }: { a: AppointmentOut }) => {
    const isFuture = new Date(a.appointment_datetime) > new Date() && a.status !== "cancelled";
    return (
      <div style={{ padding: 20, borderRadius: 14, background: a.status === "cancelled" ? "rgba(30,41,59,0.3)" : "rgba(15,23,42,0.8)", border: `1px solid ${a.status === "confirmed" ? "rgba(34,197,94,0.25)" : a.status === "cancelled" ? "rgba(30,41,59,0.3)" : "rgba(59,130,246,0.2)"}`, backdropFilter: "blur(10px)", opacity: a.status === "cancelled" ? 0.65 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>🩺 {a.doctor_name}</div>
            {a.doctor_specialization && <div style={{ fontSize: 12, color: "#94a3b8" }}>{a.doctor_specialization}</div>}
            {a.doctor_hospital && <div style={{ fontSize: 11, color: "#64748b" }}>{a.doctor_hospital}{a.doctor_city ? ` · ${a.doctor_city}` : ""}</div>}
          </div>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 999, background: a.status === "confirmed" ? "rgba(34,197,94,0.12)" : a.status === "cancelled" ? "rgba(148,163,184,0.12)" : "rgba(251,191,36,0.12)", color: a.status === "confirmed" ? "#86efac" : a.status === "cancelled" ? "#94a3b8" : "#fcd34d", border: `1px solid ${a.status === "confirmed" ? "rgba(34,197,94,0.25)" : a.status === "cancelled" ? "rgba(148,163,184,0.2)" : "rgba(251,191,36,0.25)"}`, fontWeight: 600, textTransform: "capitalize" }}>
            {a.status}
          </span>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#94a3b8" }}>
          <span>📅 {fmtDT(a.appointment_datetime)}</span>
          <span>{a.mode === "Virtual" ? "💻 Virtual" : "🏥 In-person"}</span>
        </div>

        {a.notes && (
          <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(15,23,42,0.5)", fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
            📝 {a.notes}
          </div>
        )}

        {isFuture && (
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button
              onClick={() => handleCancel(a.id)}
              disabled={cancelling === a.id}
              style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontSize: 12, cursor: "pointer", fontWeight: 600, opacity: cancelling === a.id ? 0.6 : 1 }}>
              {cancelling === a.id ? "Cancelling…" : "Cancel Appointment"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <PatientLayout>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, padding: "12px 18px", borderRadius: 12, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontWeight: 700, zIndex: 50, boxShadow: "0 10px 30px rgba(34,197,94,0.3)" }}>
          ✅ {toast}
        </div>
      )}

      <div style={{ padding: "32px 24px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#fff,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                My Appointments
              </h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                {upcoming.length} upcoming · {past.length} past/cancelled
              </p>
            </div>
            <button onClick={() => navigate("/patient/doctors")}
              style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 22px rgba(139,92,246,0.3)" }}>
              + Book New
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
            <div>Loading appointments…</div>
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(15,23,42,0.6)", borderRadius: 16, border: "1px solid rgba(30,41,59,0.5)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>No appointments yet</h2>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 20px" }}>Browse specialists and book your first consultation</p>
            <button onClick={() => navigate("/patient/doctors")}
              style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Find Doctors →
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 24 }}>
            {upcoming.length > 0 && (
              <section>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#67e8f9", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 14px" }}>
                  ↑ Upcoming ({upcoming.length})
                </h2>
                <div style={{ display: "grid", gap: 12 }}>
                  {upcoming.map((a) => <CARD key={a.id} a={a} />)}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 14px" }}>
                  Past & Cancelled ({past.length})
                </h2>
                <div style={{ display: "grid", gap: 12 }}>
                  {past.map((a) => <CARD key={a.id} a={a} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default MyAppointmentsPage;
