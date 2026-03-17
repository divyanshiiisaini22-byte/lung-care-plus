import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

const PatientSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { label: "Dashboard", path: "/patient/dashboard", icon: "🏠" },
    { label: "CT Scan", path: "/patient/scan", icon: "🫁" },
    { label: "My Appointments", path: "/patient/appointments", icon: "📅" },
    { label: "Find Doctors", path: "/patient/doctors", icon: "👨‍⚕️" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const w = collapsed ? 72 : 240;

  return (
    <div style={{
      width: w,
      minHeight: "100vh",
      background: "rgba(8,14,26,0.97)",
      backdropFilter: "blur(10px)",
      borderRight: "1px solid rgba(30,41,59,0.6)",
      padding: collapsed ? "20px 8px" : "20px 14px",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      alignSelf: "flex-start",
      transition: "width 0.2s ease",
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid rgba(30,41,59,0.5)" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #3b82f6, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
          🫁
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>LungCare+</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Patient Portal</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          style={{ marginLeft: "auto", width: 28, height: 28, borderRadius: 8, background: "rgba(30,41,59,0.5)", border: "1px solid rgba(30,41,59,0.8)", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "12px 0" : "11px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 10,
                border: "none",
                background: active ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15))" : "transparent",
                color: active ? "#67e8f9" : "#cbd5e1",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                transition: "all 0.18s",
                position: "relative",
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; e.currentTarget.style.color = "#e2e8f0"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#cbd5e1"; } }}>
              {active && (
                <div style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: 3, borderRadius: "0 2px 2px 0", background: "linear-gradient(180deg,#3b82f6,#06b6d4)" }} />
              )}
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && item.badge > 0 && (
                <span style={{ marginLeft: "auto", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ paddingTop: 20, borderTop: "1px solid rgba(30,41,59,0.5)" }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(59,130,246,0.08)" }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
              {user?.full_name?.[0] || "P"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.full_name || "Patient"}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>Patient account</div>
            </div>
          </div>
        )}
        <button onClick={logout}
          title={collapsed ? "Logout" : undefined}
          style={{ width: "100%", padding: collapsed ? "11px 0" : "10px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8 }}>
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default PatientSidebar;
