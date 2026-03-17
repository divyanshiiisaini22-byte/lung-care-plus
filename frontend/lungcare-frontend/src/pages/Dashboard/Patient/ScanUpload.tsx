import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "../../../components/PatientLayout";
import { predictScan, recommendDoctors, type ScanPredictResult, type SymptomRecommendResult, type DoctorMini } from "../../../api/scan";

type Step = "upload" | "loading" | "result" | "symptom" | "doctors";

const SYMPTOM_OPTIONS = {
  "1": { label: "Fever & fatigue", detail: "Mild fever, headache, and fatigue", icon: "🤒" },
  "2": { label: "Breathing issues", detail: "Shortness of breath, wheezing, chest tightness", icon: "😮‍💨" },
  "3": { label: "Cold & throat", detail: "Runny nose, sore throat and mild cough", icon: "🤧" },
};

const ScanUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ScanPredictResult | null>(null);
  const [symptomResult, setSymptomResult] = useState<SymptomRecommendResult | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a JPEG or PNG image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB");
      return;
    }
    setError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAnalyse = async () => {
    if (!selectedFile) return;
    setStep("loading");
    setError(null);
    try {
      const data = await predictScan(selectedFile);
      setResult(data);
      setStep("result");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Analysis failed. Please try again.";
      setError(msg);
      setStep("upload");
    }
  };

  const handleSymptomSelect = async (choice: string) => {
    if (!result) return;
    setSelectedSymptom(choice);
    setStep("loading");
    try {
      const data = await recommendDoctors(result.scan_id, choice);
      setSymptomResult(data);
      setStep("doctors");
    } catch {
      setError("Could not load doctor recommendations");
      setStep("symptom");
    }
  };

  const reset = () => {
    setStep("upload");
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setSymptomResult(null);
    setSelectedSymptom(null);
    setError(null);
  };

  const REC_CARD = ({ doc }: { doc: DoctorMini }) => (
    <div style={{ padding: 16, borderRadius: 14, background: "rgba(15,23,42,0.7)", border: "1px solid rgba(148,163,184,0.15)", display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>🩺 {doc.full_name}</div>
          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{doc.specialization}</div>
          <div style={{ color: "#64748b", fontSize: 11, marginTop: 1 }}>{doc.hospital_name} · {doc.city}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12 }}>
          <div style={{ color: "#fbbf24", fontWeight: 700 }}>⭐ {doc.rating.toFixed(1)}</div>
          <div style={{ color: "#a5b4fc", marginTop: 2 }}>₹{doc.consultation_fee}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {doc.accepts_virtual && <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd", fontSize: 11 }}>💻 Virtual</span>}
      </div>
      <button
        onClick={() => navigate("/patient/doctors")}
        style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)", color: "#93c5fd", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
        Book Appointment →
      </button>
    </div>
  );

  return (
    <PatientLayout>
      <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 8px 24px rgba(59,130,246,0.3)" }}>🫁</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#fff,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                CT Scan Analysis
              </h1>
              <p style={{ margin: "3px 0 0", color: "#94a3b8", fontSize: 13 }}>
                AI-powered lung cancer detection · Results in seconds
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 20, flexWrap: "wrap" }}>
            {[
              { key: "upload", label: "Upload" },
              { key: "result", label: "AI Result" },
              { key: "symptom", label: "Symptoms" },
              { key: "doctors", label: "Doctors" },
            ].map((s, i) => {
              const steps: Step[] = ["upload", "result", "symptom", "doctors"];
              const currentIdx = steps.indexOf(step === "loading" ? "result" : step);
              const stepIdx = steps.indexOf(s.key as Step);
              const done = stepIdx < currentIdx;
              const active = stepIdx === currentIdx;
              return (
                <React.Fragment key={s.key}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: done ? "#22c55e" : active ? "linear-gradient(135deg,#3b82f6,#06b6d4)" : "rgba(30,41,59,0.7)", color: done || active ? "#fff" : "#64748b", border: done ? "none" : active ? "none" : "1px solid rgba(30,41,59,0.8)" }}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: 12, color: active ? "#e2e8f0" : done ? "#22c55e" : "#64748b", fontWeight: active ? 600 : 400 }}>{s.label}</span>
                  </div>
                  {i < 3 && <div style={{ width: 24, height: 1, background: done ? "rgba(34,197,94,0.5)" : "rgba(30,41,59,0.5)" }} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── UPLOAD STEP ── */}
        {step === "upload" && (
          <div style={{ display: "grid", gap: 20 }}>
            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Drop zone */}
            <div
              ref={dropZoneRef}
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              style={{
                padding: "48px 32px",
                borderRadius: 20,
                border: `2px dashed ${dragging ? "#3b82f6" : selectedFile ? "rgba(34,197,94,0.5)" : "rgba(148,163,184,0.2)"}`,
                background: dragging ? "rgba(59,130,246,0.06)" : selectedFile ? "rgba(34,197,94,0.04)" : "rgba(15,23,42,0.5)",
                backdropFilter: "blur(10px)",
                textAlign: "center",
                cursor: selectedFile ? "default" : "pointer",
                transition: "all 0.2s",
              }}>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {selectedFile && preview ? (
                <div style={{ display: "grid", gap: 16, alignItems: "center", justifyItems: "center" }}>
                  <img src={preview} alt="CT scan preview" style={{ maxWidth: 280, maxHeight: 200, borderRadius: 12, border: "2px solid rgba(34,197,94,0.4)", objectFit: "contain" }} />
                  <div>
                    <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 15 }}>✅ {selectedFile.name}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 3 }}>{(selectedFile.size / 1024).toFixed(0)} KB · Ready for analysis</div>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); reset(); }}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.25)", background: "rgba(15,23,42,0.6)", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>{dragging ? "📂" : "🔬"}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>
                    {dragging ? "Drop your CT scan here" : "Upload CT Scan Image"}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>
                    Drag & drop or click to select · JPEG, PNG · Max 10 MB
                  </div>
                  <span style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd", fontSize: 13, fontWeight: 600 }}>
                    Choose File
                  </span>
                </div>
              )}
            </div>

            {selectedFile && (
              <button onClick={handleAnalyse}
                style={{ padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 12px 36px rgba(59,130,246,0.4)", letterSpacing: "0.3px" }}>
                🔬 Analyse with AI →
              </button>
            )}

            <div style={{ padding: 16, borderRadius: 14, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", color: "#fde68a", fontSize: 12, lineHeight: 1.7 }}>
              ⚠️ <strong>Medical Disclaimer:</strong> This tool provides AI-assisted screening only and is not a substitute for professional medical diagnosis. Always consult a certified physician for medical decisions.
            </div>
          </div>
        )}

        {/* ── LOADING STEP ── */}
        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 28 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid rgba(59,130,246,0.1)", borderTop: "3px solid #3b82f6", animation: "spin 1s linear infinite", margin: "0 auto" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🫁</div>
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>Analysing your CT scan…</h2>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Running deep neural network inference · This takes a few seconds</p>
          </div>
        )}

        {/* ── RESULT STEP ── */}
        {step === "result" && result && (
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{
              padding: 28,
              borderRadius: 20,
              background: result.prediction === "cancer"
                ? "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.08))"
                : "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.08))",
              border: `1px solid ${result.prediction === "cancer" ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 52 }}>{result.prediction === "cancer" ? "⚠️" : "✅"}</div>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: result.prediction === "cancer" ? "#fca5a5" : "#86efac" }}>
                    {result.prediction === "cancer" ? "Potential Cancer Indicators Detected" : "No Cancer Detected"}
                  </h2>
                  <div style={{ color: "#94a3b8", fontSize: 14 }}>
                    AI Confidence: <strong style={{ color: result.prediction === "cancer" ? "#fca5a5" : "#86efac" }}>{result.confidence.toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, color: "#cbd5e1", fontSize: 14, lineHeight: 1.7 }}>{result.message}</p>
            </div>

            {result.prediction === "cancer" && result.doctors && (
              <div>
                <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>
                  🏥 Recommended Specialists
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
                  {result.doctors.map((doc) => <REC_CARD key={doc.id} doc={doc} />)}
                </div>
              </div>
            )}

            {result.prediction === "normal" && (
              <>
                <div style={{ padding: 20, borderRadius: 16, background: "rgba(15,23,42,0.7)", border: "1px solid rgba(148,163,184,0.12)" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Do you have other symptoms?</h3>
                  <p style={{ margin: "0 0 16px", color: "#94a3b8", fontSize: 13 }}>Select your closest symptom to get matched with the right specialist.</p>
                  <div style={{ display: "grid", gap: 10 }}>
                    {Object.entries(SYMPTOM_OPTIONS).map(([key, val]) => (
                      <button key={key} onClick={() => { setStep("symptom"); setSelectedSymptom(key); }}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(148,163,184,0.2)", background: "rgba(15,23,42,0.5)", color: "#e2e8f0", cursor: "pointer", textAlign: "left", transition: "all 0.18s", fontSize: 14 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(15,23,42,0.5)"; e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)"; }}>
                        <span style={{ fontSize: 24 }}>{val.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700 }}>{val.label}</div>
                          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{val.detail}</div>
                        </div>
                        <span style={{ marginLeft: "auto", color: "#64748b" }}>→</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => navigate("/patient/doctors")}
                  style={{ padding: "12px", borderRadius: 12, border: "1px solid rgba(148,163,184,0.2)", background: "rgba(15,23,42,0.5)", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
                  Skip — browse all doctors →
                </button>
              </>
            )}

            <button onClick={reset}
              style={{ padding: "11px", borderRadius: 12, border: "1px solid rgba(148,163,184,0.2)", background: "transparent", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
              ← Scan another image
            </button>
          </div>
        )}

        {/* ── SYMPTOM LOADING / DOCTORS ── */}
        {step === "symptom" && selectedSymptom && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{SYMPTOM_OPTIONS[selectedSymptom as keyof typeof SYMPTOM_OPTIONS]?.icon}</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Finding specialists…</h2>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Matching you with doctors for {SYMPTOM_OPTIONS[selectedSymptom as keyof typeof SYMPTOM_OPTIONS]?.label}</p>
            {/* Trigger fetch */}
            {(() => { handleSymptomSelect(selectedSymptom); return null; })()}
          </div>
        )}

        {step === "doctors" && symptomResult && (
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ padding: 20, borderRadius: 16, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Recommended for {symptomResult.illness}</h2>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Based on your symptoms, here are the best-matched specialists.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
              {symptomResult.doctors.map((doc) => <REC_CARD key={doc.id} doc={doc} />)}
            </div>
            <button onClick={reset}
              style={{ padding: "11px", borderRadius: 12, border: "1px solid rgba(148,163,184,0.2)", background: "transparent", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
              ← Start new scan
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PatientLayout>
  );
};

export default ScanUploadPage;
