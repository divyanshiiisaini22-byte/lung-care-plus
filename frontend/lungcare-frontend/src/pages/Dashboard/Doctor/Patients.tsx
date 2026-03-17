import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../../../components/DoctorLayout";
import { getPatientsList } from "../../../api/dashboard";
import type { PatientListItem } from "../../../api/dashboard";

type SortField = "name" | "age" | "last_scan_date" | "risk_level";

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    getPatientsList()
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = patients.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === "All" || p.risk_level === riskFilter;
      return matchSearch && matchRisk;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "age") cmp = (a.age ?? 0) - (b.age ?? 0);
      else if (sortField === "risk_level") cmp = a.risk_level.localeCompare(b.risk_level);
      else if (sortField === "last_scan_date") cmp = (a.last_scan_date ?? "").localeCompare(b.last_scan_date ?? "");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [patients, search, riskFilter, sortField, sortDir]);

  const riskColors: Record<string, { bg: string; border: string; text: string }> = {
    High:   { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.3)",  text: "#fca5a5" },
    Medium: { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", text: "#fcd34d" },
    Low:    { bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.3)",  text: "#86efac" },
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const exportCSV = () => {
    const rows = [["Name", "Age", "Risk", "Last Scan", "Scan Count"]];
    filtered.forEach((p) => rows.push([p.name, String(p.age ?? ""), p.risk_level, p.last_scan_date ?? "", String(p.scan_count)]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "patients.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DoctorLayout>
      <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👥</div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, background: "linear-gradient(135deg,#fff,#93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>My Patients</h1>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "3px 0 0" }}>{patients.length} patients connected to you</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={exportCSV} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.1)", color: "#86efac", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              ⬇ Export CSV
            </button>
            <div style={{ display: "flex", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 10, overflow: "hidden" }}>
              {(["grid", "table"] as const).map((m) => (
                <button key={m} onClick={() => setViewMode(m)}
                  style={{ padding: "10px 16px", border: "none", background: viewMode === m ? "rgba(59,130,246,0.2)" : "transparent", color: viewMode === m ? "#93c5fd" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  {m === "grid" ? "⊞" : "☰"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍  Search by name…"
            style={{ flex: 1, minWidth: 200, padding: "10px 14px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 10, color: "#e2e8f0", fontSize: 14 }} />
          <div style={{ display: "flex", gap: 6 }}>
            {(["All", "High", "Medium", "Low"] as const).map((r) => (
              <button key={r} onClick={() => setRiskFilter(r)}
                style={{ padding: "10px 16px", borderRadius: 10, background: riskFilter === r ? (r === "High" ? "rgba(239,68,68,0.25)" : r === "Medium" ? "rgba(251,191,36,0.25)" : r === "Low" ? "rgba(34,197,94,0.25)" : "rgba(59,130,246,0.25)") : "rgba(15,23,42,0.8)", color: riskFilter === r ? (r === "High" ? "#fca5a5" : r === "Medium" ? "#fcd34d" : r === "Low" ? "#86efac" : "#93c5fd") : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600, border: "1px solid rgba(30,41,59,0.4)" }}>
                {r}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Sort:</span>
            {(["name", "age", "risk_level"] as SortField[]).map((f) => (
              <button key={f} onClick={() => handleSort(f)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(30,41,59,0.5)", background: sortField === f ? "rgba(139,92,246,0.2)" : "transparent", color: sortField === f ? "#c4b5fd" : "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {f === "risk_level" ? "Risk" : f.charAt(0).toUpperCase() + f.slice(1)} {sortField === f ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div style={{ width: 36, height: 36, border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <p style={{ fontSize: 16 }}>{patients.length === 0 ? "No patients have booked with you yet." : "No patients match your filters."}</p>
          </div>
        ) : viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map((p) => {
              const rc = riskColors[p.risk_level] || riskColors["Low"];
              return (
                <div key={p.id} onClick={() => navigate(`/dashboard/doctor/patients/${p.id}`)}
                  style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)", border: `1px solid ${rc.border}`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: rc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.age ? `Age ${p.age}` : "Age N/A"}</div>
                      </div>
                    </div>
                    <span style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>{p.risk_level}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "rgba(30,41,59,0.4)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>SCANS</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#a5b4fc" }}>{p.scan_count}</div>
                    </div>
                    <div style={{ background: "rgba(30,41,59,0.4)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>LAST SCAN</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>
                        {p.last_scan_date ? new Date(p.last_scan_date).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(30,41,59,0.6)" }}>
                  {["Name", "Age", "Risk Level", "Scans", "Last Scan"].map((h, i) => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", cursor: i < 3 ? "pointer" : "default" }}>
                      {h}
                    </th>
                  ))}
                  <th style={{ padding: "14px 20px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const rc = riskColors[p.risk_level] || riskColors["Low"];
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid rgba(30,41,59,0.3)", transition: "background 0.2s", cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,130,246,0.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = ""}
                      onClick={() => navigate(`/dashboard/doctor/patients/${p.id}`)}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 14, color: "#94a3b8" }}>{p.age ?? "—"}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>{p.risk_level}</span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 14, color: "#a5b4fc", fontWeight: 600 }}>{p.scan_count}</td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#94a3b8" }}>{p.last_scan_date ? new Date(p.last_scan_date).toLocaleDateString() : "—"}</td>
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/doctor/patients/${p.id}`); }}
                          style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.1)", color: "#93c5fd", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
};

export default Patients;
