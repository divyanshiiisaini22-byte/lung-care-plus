import React, { useEffect, useState } from "react";
import DoctorLayout from "../../../components/DoctorLayout";
import { getAnalytics } from "../../../api/dashboard";
import type { AnalyticsOut } from "../../../api/dashboard";

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const maxBar = data ? Math.max(...data.scan_trend.map((s) => s.count), 1) : 1;

  return (
    <DoctorLayout>
      <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 500, height: 500, background: "radial-gradient(circle at 80% 20%, rgba(139,92,246,0.08), transparent 50%)", pointerEvents: "none" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#8b5cf6,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📈</div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, background: "linear-gradient(135deg,#fff,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Analytics & Insights</h1>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "4px 0 0" }}>Real-time data about your patient population</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <div style={{ width: 36, height: 36, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : !data ? null : (
          <>
            {/* Key Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Total Patients", value: data.total_patients, icon: "👥", color: "#3b82f6", rgb: "59,130,246" },
                { label: "Total Scans",    value: data.total_scans,    icon: "📸", color: "#8b5cf6", rgb: "139,92,246" },
                { label: "Cancer Cases",   value: data.cancer_cases,   icon: "🔴", color: "#ef4444", rgb: "239,68,68" },
                { label: "Normal Cases",   value: data.normal_cases,   icon: "✅", color: "#22c55e", rgb: "34,197,94" },
                { label: "Total Appts",    value: data.total_appointments, icon: "📅", color: "#f97316", rgb: "249,115,22" },
              ].map((s) => (
                <div key={s.label}
                  style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)", border: `1px solid rgba(${s.rgb},0.2)`, borderRadius: 16, padding: 20, transition: "all 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(${s.rgb},0.2)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 26 }}>{s.icon}</span>
                    <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Risk Distribution */}
              <div style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#e2e8f0" }}>Risk Level Distribution</h2>
                {[
                  { label: "High Risk",   value: data.risk_distribution.high,   total: data.total_patients, color: "#ef4444" },
                  { label: "Medium Risk", value: data.risk_distribution.medium, total: data.total_patients, color: "#fbbf24" },
                  { label: "Low Risk",    value: data.risk_distribution.low,    total: data.total_patients, color: "#22c55e" },
                ].map((item) => {
                  const pct = item.total > 0 ? (item.value / item.total) * 100 : 0;
                  return (
                    <div key={item.label} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                          <span style={{ fontSize: 14, color: "#cbd5e1" }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: 14, color: item.color, fontWeight: 600 }}>{item.value} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div style={{ height: 10, borderRadius: 5, background: "rgba(30,41,59,0.5)", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${item.color},${item.color}bb)`, borderRadius: 5 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Age Distribution */}
              <div style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#e2e8f0" }}>Age Distribution</h2>
                {(() => {
                  const ages = data.age_distribution;
                  const maxAge = Math.max(...Object.values(ages), 1);
                  return Object.entries(ages).map(([range, count]) => (
                    <div key={range} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#cbd5e1" }}>{range} yrs</span>
                        <span style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 600 }}>{count}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: "rgba(30,41,59,0.5)", overflow: "hidden" }}>
                        <div style={{ width: `${(count / maxAge) * 100}%`, height: "100%", background: "linear-gradient(90deg,#8b5cf6,#ec4899)", borderRadius: 4 }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Scan Trend Bar Chart */}
            <div style={{ background: "rgba(15,23,42,0.8)", backdropFilter: "blur(10px)", border: "1px solid rgba(30,41,59,0.5)", borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: "#e2e8f0" }}>Monthly Scan Trend</h2>
              {data.scan_trend.length === 0 ? (
                <p style={{ textAlign: "center", color: "#64748b", padding: 24 }}>No scan data available yet.</p>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 200, padding: "0 20px" }}>
                  {data.scan_trend.map((item, idx) => {
                    const heightPct = (item.count / maxBar) * 100;
                    const isLast = idx === data.scan_trend.length - 1;
                    return (
                      <div key={item.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div style={{ width: "100%", height: `${Math.max(heightPct, 5)}%`, background: isLast ? "linear-gradient(180deg,#8b5cf6,#ec4899)" : "linear-gradient(180deg,#3b82f6,#60a5fa)", borderRadius: "8px 8px 0 0", transition: "all 0.4s", cursor: "pointer", position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 6 }}
                          title={`${item.count} scans`}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{item.count}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DoctorLayout>
  );
};

export default AnalyticsPage;
