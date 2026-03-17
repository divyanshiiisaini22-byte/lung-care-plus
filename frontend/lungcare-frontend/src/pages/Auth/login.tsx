import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

type ActiveRole = "doctor" | "patient";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<ActiveRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "doctor") {
        navigate("/dashboard/doctor", { replace: true });
      } else {
        navigate("/patient/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    if (activeRole === "doctor") {
      setEmail("alice.brown@lungcare.com");
      setPassword("Doctor@123");
    } else {
      setEmail("patient@lungcare.com");
      setPassword("Patient@123");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
      background: "radial-gradient(circle at 15% 25%, rgba(59,130,246,0.15), transparent 30%), radial-gradient(circle at 85% 15%, rgba(139,92,246,0.15), transparent 28%), radial-gradient(circle at 50% 80%, rgba(16,185,129,0.1), transparent 35%), #080e1a",
    }}>
      {/* Glow orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(59,130,246,0.06)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "5%", width: 350, height: 350, borderRadius: "50%", background: "rgba(139,92,246,0.07)", filter: "blur(80px)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 1100, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "stretch", position: "relative", zIndex: 1 }}>

        {/* Hero panel */}
        <div style={{ padding: 32, display: "grid", alignContent: "space-between", gap: 24, background: "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))", border: "1px solid rgba(148,163,184,0.12)", borderRadius: 20, backdropFilter: "blur(14px)", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd", fontSize: 13, fontWeight: 600, marginBottom: 18 }}>
              🫁 LungCare+ · AI Platform
            </div>
            <h1 style={{ fontSize: 34, lineHeight: 1.2, margin: "0 0 14px", background: "linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #67e8f9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              AI-guided lung cancer detection & specialist care
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.65, margin: 0 }}>
              Upload your CT scan for instant AI analysis, connect with pulmonologists, and manage follow-ups — all in one secure platform.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { value: "94%", label: "Detection accuracy", color: "#67e8f9" },
              { value: "12+", label: "Specialist doctors", color: "#c084fc" },
              { value: "< 5s", label: "Scan analysis", color: "#4ade80" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "16px 12px", borderRadius: 14, background: "rgba(2,6,23,0.7)", border: "1px solid rgba(30,41,59,0.5)", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["AI risk stratification", "End-to-end encrypted", "Instant doctor connect"].map((chip) => (
              <span key={chip} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 999, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd", fontSize: 12 }}>
                ✓ {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Login card */}
        <div style={{ padding: 32, background: "linear-gradient(165deg, rgba(15,23,42,0.96), rgba(15,23,42,0.88))", border: "1px solid rgba(148,163,184,0.12)", borderRadius: 20, backdropFilter: "blur(14px)", boxShadow: "0 24px 70px rgba(0,0,0,0.5)" }}>

          {/* Role toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "rgba(2,6,23,0.6)", padding: 4, borderRadius: 14, marginBottom: 26, border: "1px solid rgba(30,41,59,0.5)" }}>
            {(["patient", "doctor"] as ActiveRole[]).map((r) => (
              <button key={r} type="button" onClick={() => { setActiveRole(r); setError(null); setEmail(""); setPassword(""); }}
                style={{ padding: "10px", borderRadius: 10, border: "none", background: activeRole === r ? (r === "patient" ? "linear-gradient(135deg,#3b82f6,#06b6d4)" : "linear-gradient(135deg,#8b5cf6,#ec4899)") : "transparent", color: activeRole === r ? "#fff" : "#94a3b8", fontSize: 14, fontWeight: activeRole === r ? 700 : 500, cursor: "pointer", transition: "all 0.2s" }}>
                {r === "patient" ? "🧑‍💼 Patient" : "🩺 Doctor"}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 22 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>
              Sign in as {activeRole === "patient" ? "Patient" : "Doctor"}
            </h2>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
              {activeRole === "patient" ? "Access your scan history and appointments" : "View your patient panel and analytics"}
            </p>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={activeRole === "doctor" ? "alice.brown@lungcare.com" : "patient@lungcare.com"} required style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: "100%", boxSizing: "border-box" }} />
            </div>

            <button type="submit" disabled={loading}
              style={{ marginTop: 4, padding: "13px", background: activeRole === "patient" ? "linear-gradient(135deg,#3b82f6,#06b6d4)" : "linear-gradient(135deg,#8b5cf6,#ec4899)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in…" : `Enter ${activeRole === "patient" ? "Patient" : "Doctor"} Portal →`}
            </button>
          </form>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <button type="button" onClick={fillDemo}
              style={{ padding: "9px", border: "1px dashed rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.4)", borderRadius: 10, color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
              🧪 Fill demo credentials
            </button>
            <p style={{ margin: 0, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: activeRole === "patient" ? "#67e8f9" : "#c084fc", fontWeight: 600 }}>
                Create one →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
