// src/components/Sidebar.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    { label: "Dashboard", path: "/dashboard/doctor", icon: "📊" },
    { label: "Patients", path: "/dashboard/doctor/patients", icon: "👥" },
    { label: "Analytics", path: "/dashboard/doctor/analytics", icon: "📈" },
    { label: "Appointments", path: "/dashboard/doctor/appointments", icon: "📅", badge: 3 },
    { label: "Notifications", path: "/dashboard/doctor/notifications", icon: "🔔", badge: 5 },
    { label: "Settings", path: "/dashboard/doctor/settings", icon: "⚙️" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard/doctor") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      style={{
        width: 260,
        minHeight: "100vh",
        background: "rgba(15,23,42,0.95)",
        backdropFilter: "blur(10px)",
        borderRight: "1px solid rgba(30,41,59,0.5)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
      }}
    >
      {/* Logo/Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: "1px solid rgba(30,41,59,0.5)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          🫁
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>LungCare+</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Doctor Portal</div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: 10,
                border: "none",
                background: active
                  ? "rgba(59,130,246,0.15)"
                  : "transparent",
                color: active ? "#93c5fd" : "#cbd5e1",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                textAlign: "left",
                transition: "all 0.2s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                  e.currentTarget.style.color = "#e2e8f0";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#cbd5e1";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span
                  style={{
                    background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 10,
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div
        style={{
          paddingTop: 24,
          borderTop: "1px solid rgba(30,41,59,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            padding: "12px",
            borderRadius: 10,
            background: "rgba(59,130,246,0.1)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {user?.full_name?.[0] || "D"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#e2e8f0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.full_name || "Doctor"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#94a3b8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || "doctor@lungcare.com"}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.1)",
            color: "#fca5a5",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.2)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

