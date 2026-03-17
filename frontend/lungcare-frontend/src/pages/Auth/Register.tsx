import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

type ActiveRole = "patient" | "doctor";

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<ActiveRole>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const user = await register(name, email, password, role, role === "patient" && age ? Number(age) : undefined);
      navigate(user.role === "doctor" ? "/dashboard/doctor" : "/patient/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
      background: "radial-gradient(circle at 15% 25%, rgba(59,130,246,0.15), transparent 30%), radial-gradient(circle at 85% 15%, rgba(139,92,246,0.15), transparent 28%), #080e1a",
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(59,130,246,0.06)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "5%", width: 350, height: 350, borderRadius: "50%", background: "rgba(139,92,246,0.07)", filter: "blur(80px)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
        <div style={{ padding: 36, background: "linear-gradient(165deg, rgba(15,23,42,0.97), rgba(15,23,42,0.9))", border: "1px solid rgba(148,163,184,0.12)", borderRadius: 22, backdropFilter: "blur(14px)", boxShadow: "0 24px 70px rgba(0,0,0,0.5)" }}>

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🫁</div>
            <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#fff,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Join LungCare+
            </h1>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>AI-powered lung health platform</p>
          </div>

          {/* Role toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "rgba(2,6,23,0.6)", padding: 4, borderRadius: 14, marginBottom: 24, border: "1px solid rgba(30,41,59,0.5)" }}>
            {(["patient", "doctor"] as ActiveRole[]).map((r) => (
              <button key={r} type="button" onClick={() => { setRole(r); setError(null); }}
                style={{ padding: "10px", borderRadius: 10, border: "none", background: role === r ? (r === "patient" ? "linear-gradient(135deg,#3b82f6,#06b6d4)" : "linear-gradient(135deg,#8b5cf6,#ec4899)") : "transparent", color: role === r ? "#fff" : "#94a3b8", fontSize: 14, fontWeight: role === r ? 700 : 500, cursor: "pointer", transition: "all 0.2s" }}>
                {r === "patient" ? "🧑‍💼 Patient" : "🩺 Doctor"}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required style={{ width: "100%", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: "100%", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" required minLength={8} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>

            {role === "patient" && (
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>Age (optional)</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 35" min="1" max="120" style={{ width: "100%", boxSizing: "border-box" }} />
              </div>
            )}

            {role === "doctor" && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", color: "#fde68a", fontSize: 12 }}>
                ℹ️ New doctor accounts are created as basic users. Contact support to have specialist credentials added.
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ marginTop: 4, padding: "13px", background: role === "patient" ? "linear-gradient(135deg,#3b82f6,#06b6d4)" : "linear-gradient(135deg,#8b5cf6,#ec4899)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating account…" : `Create ${role === "patient" ? "Patient" : "Doctor"} Account →`}
            </button>
          </form>

          <p style={{ margin: "16px 0 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: role === "patient" ? "#67e8f9" : "#c084fc", fontWeight: 600 }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
