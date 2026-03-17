import { useEffect, useMemo, useState, useCallback } from "react";
import { getDoctors, getDoctorDetail, type Doctor, type SlotOut } from "../../../api/doctors";
import { bookAppointment } from "../../../api/appointments";
import PatientLayout from "../../../components/PatientLayout";
import DoctorCard from "../../../components/DoctorCard";

interface BookingForm {
  slot: SlotOut | null;
  mode: "Virtual" | "In-person";
  note: string;
}

const DoctorConnect = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [availability, setAvailability] = useState<"any" | "available">("any");
  const [feeRange, setFeeRange] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("rating_desc");
  const [visibleCount, setVisibleCount] = useState(6);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("doctor_favorites") || "[]"); } catch { return []; }
  });
  const [detailsDoctor, setDetailsDoctor] = useState<Doctor | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<SlotOut[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({ slot: null, mode: "Virtual", note: "" });
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getDoctors()
      .then(setDoctors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const specializations = useMemo(() => {
    return ["all", ...Array.from(new Set(doctors.map((d) => d.specialization)))];
  }, [doctors]);

  const filtered = useMemo(() => {
    let result = doctors.filter((d) => {
      const t = search.toLowerCase().trim();
      if (t && !d.full_name.toLowerCase().includes(t) && !d.city.toLowerCase().includes(t) && !d.specialization.toLowerCase().includes(t)) return false;
      if (specialization !== "all" && d.specialization !== specialization) return false;
      if (availability === "available" && !d.is_available) return false;
      if (feeRange === "lt800" && d.consultation_fee >= 800) return false;
      if (feeRange === "800to1200" && (d.consultation_fee < 800 || d.consultation_fee > 1200)) return false;
      if (feeRange === "gt1200" && d.consultation_fee <= 1200) return false;
      if (d.rating < minRating) return false;
      return true;
    });
    result = [...result].sort((a, b) => {
      if (sort === "rating_desc") return b.rating - a.rating;
      if (sort === "fee_asc") return a.consultation_fee - b.consultation_fee;
      if (sort === "fee_desc") return b.consultation_fee - a.consultation_fee;
      if (sort === "experience_desc") return b.experience_years - a.experience_years;
      return 0;
    });
    return result;
  }, [doctors, search, specialization, availability, feeRange, minRating, sort]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("doctor_favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const openBooking = useCallback(async (doc: Doctor) => {
    setBookingDoctor(doc);
    setBookingForm({ slot: null, mode: doc.accepts_virtual ? "Virtual" : "In-person", note: "" });
    setSlotsLoading(true);
    try {
      const detail = await getDoctorDetail(doc.slug);
      setSlots(detail.slots);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const saveBooking = async () => {
    if (!bookingDoctor || !bookingForm.slot) return;
    setBooking(true);
    try {
      await bookAppointment(bookingDoctor.slug, bookingForm.slot.datetime_iso, bookingForm.mode, bookingForm.note || undefined);
      setToast(`✅ Appointment booked with ${bookingDoctor.full_name}!`);
      setTimeout(() => setToast(null), 3000);
      setBookingDoctor(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Booking failed";
      setToast(`⚠️ ${msg}`);
      setTimeout(() => setToast(null), 3500);
    } finally {
      setBooking(false);
    }
  };

  const closeOverlays = () => { setDetailsDoctor(null); setBookingDoctor(null); };

  return (
    <PatientLayout>
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, padding: "12px 18px", borderRadius: 12, background: toast.startsWith("⚠️") ? "rgba(239,68,68,0.9)" : "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontWeight: 700, zIndex: 50, boxShadow: "0 10px 30px rgba(0,0,0,0.3)", maxWidth: 320 }}>
          {toast}
        </div>
      )}

      <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24, padding: 24, borderRadius: 18, background: "rgba(15,23,42,0.8)", border: "1px solid rgba(148,163,184,0.1)", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd", fontSize: 12 }}>🫁 Lung specialists</span>
            <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#86efac", fontSize: 12 }}>Verified profiles</span>
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#fff,#a5b4fc,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Find the right lung care expert — fast.
          </h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Browse pulmonologists, radiologists, and thoracic surgeons with real-time booking.</p>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 20, padding: 18, borderRadius: 16, background: "rgba(15,23,42,0.7)", border: "1px solid rgba(30,41,59,0.5)", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <div style={{ display: "grid", gap: 5 }}>
              <label style={{ fontSize: 12, color: "#94a3b8" }}>Search</label>
              <input value={search} onChange={(e) => { setSearch(e.target.value); setVisibleCount(6); }} placeholder="Name, city, specialization…" />
            </div>
            <div style={{ display: "grid", gap: 5 }}>
              <label style={{ fontSize: 12, color: "#94a3b8" }}>Specialization</label>
              <select value={specialization} onChange={(e) => { setSpecialization(e.target.value); setVisibleCount(6); }}>
                {specializations.map((s) => <option key={s} value={s}>{s === "all" ? "All" : s}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gap: 5 }}>
              <label style={{ fontSize: 12, color: "#94a3b8" }}>Availability</label>
              <select value={availability} onChange={(e) => { setAvailability(e.target.value as "any" | "available"); setVisibleCount(6); }}>
                <option value="any">Any</option>
                <option value="available">Available now</option>
              </select>
            </div>
            <div style={{ display: "grid", gap: 5 }}>
              <label style={{ fontSize: 12, color: "#94a3b8" }}>Fee range</label>
              <select value={feeRange} onChange={(e) => { setFeeRange(e.target.value); setVisibleCount(6); }}>
                <option value="all">Any</option>
                <option value="lt800">Under ₹800</option>
                <option value="800to1200">₹800–₹1200</option>
                <option value="gt1200">Above ₹1200</option>
              </select>
            </div>
            <div style={{ display: "grid", gap: 5 }}>
              <label style={{ fontSize: 12, color: "#94a3b8" }}>Min rating</label>
              <select value={minRating} onChange={(e) => { setMinRating(Number(e.target.value)); setVisibleCount(6); }}>
                <option value={0}>Any</option>
                <option value={4.5}>4.5+</option>
                <option value={4}>4.0+</option>
              </select>
            </div>
            <div style={{ display: "grid", gap: 5 }}>
              <label style={{ fontSize: 12, color: "#94a3b8" }}>Sort by</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="rating_desc">Rating ↓</option>
                <option value="fee_asc">Fee ↑</option>
                <option value="fee_desc">Fee ↓</option>
                <option value="experience_desc">Experience ↓</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 10, color: "#64748b", fontSize: 12 }}>
            Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} doctors
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ padding: 18, borderRadius: 16, background: "rgba(15,23,42,0.7)", height: 220, border: "1px solid rgba(30,41,59,0.4)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "rgba(15,23,42,0.6)", borderRadius: 16, color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
            <div>No doctors match your filters</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
            {filtered.slice(0, visibleCount).map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                isFavorite={favorites.includes(doc.id)}
                onToggleFavorite={toggleFavorite}
                onViewDetails={(d) => setDetailsDoctor(d)}
                onRequestConsultation={(d) => openBooking(d)}
              />
            ))}
          </div>
        )}

        {!loading && filtered.length > visibleCount && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => setVisibleCount((v) => v + 6)}
              style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(59,130,246,0.35)", background: "rgba(59,130,246,0.1)", color: "#93c5fd", fontWeight: 700, cursor: "pointer" }}>
              Load more doctors
            </button>
          </div>
        )}
      </div>

      {/* Details drawer */}
      {detailsDoctor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "flex-end", zIndex: 40, backdropFilter: "blur(3px)" }} onClick={closeOverlays}>
          <div style={{ width: 400, maxWidth: "92vw", height: "100%", overflowY: "auto", padding: 24, background: "rgba(8,14,26,0.98)", border: "1px solid rgba(30,41,59,0.6)", boxShadow: "-20px 0 60px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>🩺 {detailsDoctor.full_name}</h2>
              <button onClick={closeOverlays} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.25)", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>✕ Close</button>
            </div>
            <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
              <span style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd", display: "inline-block" }}>{detailsDoctor.specialization}</span>
              <div style={{ color: "#cbd5e1" }}>{detailsDoctor.bio}</div>
              {[
                `🏥 ${detailsDoctor.hospital_name}`,
                `🗺️ ${detailsDoctor.city}, ${detailsDoctor.country}`,
                `⭐ ${detailsDoctor.rating.toFixed(1)} (${detailsDoctor.review_count} reviews)`,
                `⏱ ${detailsDoctor.experience_years}+ yrs experience`,
                `₹ ${detailsDoctor.consultation_fee} per consult`,
                detailsDoctor.consulting_hours ? `🕐 ${detailsDoctor.consulting_hours}` : null,
              ].filter(Boolean).map((s, i) => (
                <span key={i} style={{ padding: "5px 11px", borderRadius: 999, background: "rgba(15,23,42,0.7)", border: "1px solid rgba(148,163,184,0.15)", color: "#cbd5e1", fontSize: 12, display: "inline-block" }}>{s}</span>
              ))}
              {detailsDoctor.languages && detailsDoctor.languages.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {detailsDoctor.languages.map((l) => <span key={l} style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#c4b5fd", fontSize: 11 }}>{l}</span>)}
                </div>
              )}
            </div>
            <button onClick={() => { setDetailsDoctor(null); openBooking(detailsDoctor); }}
              style={{ marginTop: 20, width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Book Appointment →
            </button>
          </div>
        </div>
      )}

      {/* Booking modal */}
      {bookingDoctor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 45, backdropFilter: "blur(3px)", padding: 16 }} onClick={closeOverlays}>
          <div style={{ width: "100%", maxWidth: 520, padding: 28, background: "rgba(8,14,26,0.98)", borderRadius: 20, border: "1px solid rgba(59,130,246,0.2)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <h3 style={{ margin: "0 0 3px", fontSize: 18, fontWeight: 800 }}>Book with {bookingDoctor.full_name}</h3>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>{bookingDoctor.specialization} · {bookingDoctor.hospital_name}</div>
              </div>
              <button onClick={closeOverlays} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 8 }}>Available Time Slots (Tomorrow)</label>
                {slotsLoading ? (
                  <div style={{ color: "#64748b", fontSize: 13 }}>Loading slots…</div>
                ) : slots.length === 0 ? (
                  <div style={{ color: "#64748b", fontSize: 13 }}>No slots available</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                    {slots.map((s) => (
                      <button key={s.datetime_iso} disabled={!s.available}
                        onClick={() => setBookingForm((f) => ({ ...f, slot: s }))}
                        style={{ padding: "10px 8px", borderRadius: 10, border: `1px solid ${bookingForm.slot?.datetime_iso === s.datetime_iso ? "rgba(59,130,246,0.6)" : s.available ? "rgba(30,41,59,0.6)" : "rgba(30,41,59,0.3)"}`, background: bookingForm.slot?.datetime_iso === s.datetime_iso ? "rgba(59,130,246,0.2)" : s.available ? "rgba(15,23,42,0.7)" : "rgba(15,23,42,0.3)", color: !s.available ? "#334155" : bookingForm.slot?.datetime_iso === s.datetime_iso ? "#93c5fd" : "#cbd5e1", fontSize: 12, fontWeight: 600, cursor: s.available ? "pointer" : "not-allowed" }}>
                        {s.time_label}
                        {!s.available && <div style={{ fontSize: 9, color: "#475569" }}>booked</div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>Mode</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["Virtual", "In-person"] as const).map((m) => (
                    <button key={m} disabled={m === "Virtual" && !bookingDoctor.accepts_virtual}
                      onClick={() => setBookingForm((f) => ({ ...f, mode: m }))}
                      style={{ padding: "10px", borderRadius: 10, border: `1px solid ${bookingForm.mode === m ? "rgba(59,130,246,0.5)" : "rgba(30,41,59,0.5)"}`, background: bookingForm.mode === m ? "rgba(59,130,246,0.12)" : "rgba(15,23,42,0.5)", color: bookingForm.mode === m ? "#93c5fd" : "#94a3b8", fontSize: 13, cursor: "pointer", opacity: m === "Virtual" && !bookingDoctor.accepts_virtual ? 0.4 : 1 }}>
                      {m === "Virtual" ? "💻 Virtual" : "🏥 In-person"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>Notes (optional)</label>
                <textarea rows={3} value={bookingForm.note} onChange={(e) => setBookingForm((f) => ({ ...f, note: e.target.value }))} placeholder="Symptoms, previous tests, questions…" style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }} />
              </div>
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button onClick={closeOverlays} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(148,163,184,0.2)", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={saveBooking} disabled={!bookingForm.slot || booking}
                style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: !bookingForm.slot ? "rgba(30,41,59,0.5)" : "linear-gradient(135deg,#3b82f6,#06b6d4)", color: !bookingForm.slot ? "#64748b" : "#fff", fontSize: 14, fontWeight: 700, cursor: !bookingForm.slot ? "not-allowed" : "pointer", opacity: booking ? 0.7 : 1 }}>
                {booking ? "Booking…" : "Confirm Booking →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
};

export default DoctorConnect;
