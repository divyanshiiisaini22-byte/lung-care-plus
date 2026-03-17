import type { Doctor } from "../api/doctors";

interface Props {
  doctor: Doctor;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  onViewDetails?: (doctor: Doctor) => void;
  onRequestConsultation?: (doctor: Doctor) => void;
}

const DoctorCard = ({ doctor, isFavorite, onToggleFavorite, onViewDetails, onRequestConsultation }: Props) => {
  const availabilityLabel = doctor.is_available
    ? doctor.next_available ? `Next: ${doctor.next_available}` : "Available now"
    : "Fully booked";

  return (
    <div
      className="glass-card"
      style={{
        padding: 20,
        background: "rgba(15,23,42,0.88)",
        display: "grid",
        gap: 14,
        borderRadius: 18,
        border: "1px solid rgba(148,163,184,0.12)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.3)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(0,0,0,0.4)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.3)"; }}>

      {/* Favorite button */}
      <button type="button" aria-label="Favorite" onClick={() => onToggleFavorite?.(doctor.id)}
        style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(148,163,184,0.3)", background: "rgba(15,23,42,0.75)", color: isFavorite ? "#fbbf24" : "#64748b", display: "grid", placeItems: "center", cursor: "pointer", fontSize: 16, transition: "all 0.2s" }}>
        {isFavorite ? "★" : "☆"}
      </button>

      {/* Doctor Info */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
          👨‍⚕️
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {doctor.full_name}
            {doctor.badges && doctor.badges.length > 0 && (
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: "rgba(251,191,36,0.15)", color: "#fcd34d", border: "1px solid rgba(251,191,36,0.25)", fontWeight: 600 }}>
                {doctor.badges[0]}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 600, marginTop: 2 }}>{doctor.specialization}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
            🏥 {doctor.hospital_name} · 📍 {doctor.city}
          </div>
        </div>
      </div>

      {/* Rating & Experience */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ padding: "5px 11px", borderRadius: 8, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fcd34d", fontSize: 13, fontWeight: 600 }}>
          ⭐ {doctor.rating.toFixed(1)} ({doctor.review_count})
        </span>
        <span style={{ padding: "5px 11px", borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc", fontSize: 13, fontWeight: 600 }}>
          🎓 {doctor.experience_years}y exp
        </span>
        <span style={{ padding: "5px 11px", borderRadius: 8, background: doctor.is_available ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)", border: `1px solid ${doctor.is_available ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`, color: doctor.is_available ? "#86efac" : "#fca5a5", fontSize: 12, fontWeight: 600 }}>
          {doctor.is_available ? "🟢" : "🔴"} {availabilityLabel}
        </span>
      </div>

      {/* Fee + Virtual */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: "rgba(30,41,59,0.4)", border: "1px solid rgba(30,41,59,0.5)" }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Consultation Fee</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#e2e8f0" }}>₹{doctor.consultation_fee.toLocaleString()}</div>
        </div>
        {doctor.accepts_virtual && (
          <span style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9", fontSize: 12, fontWeight: 600 }}>🎥 Virtual OK</span>
        )}
      </div>

      {/* Bio */}
      {doctor.bio && (
        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {doctor.bio}
        </p>
      )}

      {/* Languages */}
      {doctor.languages && doctor.languages.length > 0 && (
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {doctor.languages.map((lang) => (
            <span key={lang} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", color: "#94a3b8" }}>{lang}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => onViewDetails?.(doctor)}
          style={{ padding: "10px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#a5b4fc", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(99,102,241,0.1)"}>
          View Profile
        </button>
        <button onClick={() => onRequestConsultation?.(doctor)} disabled={!doctor.is_available}
          style={{ padding: "10px", borderRadius: 10, border: "none", background: doctor.is_available ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(30,41,59,0.5)", color: doctor.is_available ? "#fff" : "#475569", cursor: doctor.is_available ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, transition: "all 0.2s" }}>
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
