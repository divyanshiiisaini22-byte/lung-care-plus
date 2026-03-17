// src/pages/Dashboard/Doctor/Settings.tsx
import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import DoctorLayout from "../../../components/DoctorLayout";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "security" | "notifications">("profile");

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.full_name || "Dr. Demo",
    email: user?.email || "doctor@lungcare.com",
    phone: "+91 98765 43210",
    specialization: user?.specialization || "Pulmonology",
    hospital: user?.hospital_name || "City General Hospital",
    bio: "Experienced pulmonologist specializing in lung cancer detection and treatment.",
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: "dark",
    language: "en",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    notifications: {
      email: true,
      push: true,
      sms: false,
      highRiskAlerts: true,
      appointmentReminders: true,
    },
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileSave = () => {
    // In real app, this would save to backend
    showToast("Profile updated successfully!");
  };

  const handlePreferencesSave = () => {
    localStorage.setItem("preferences", JSON.stringify(preferences));
    showToast("Preferences saved successfully!");
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: "👤" },
    { id: "preferences" as const, label: "Preferences", icon: "⚙️" },
    { id: "security" as const, label: "Security", icon: "🔒" },
    { id: "notifications" as const, label: "Notifications", icon: "🔔" },
  ];

  return (
    <DoctorLayout>
      <div style={{ padding: "32px 24px", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "300px",
            background: "radial-gradient(circle at 50% 0%, rgba(139,92,246,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                ⚙️
              </div>
              <div>
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    margin: 0,
                    background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Settings
                </h1>
                <p style={{ fontSize: 14, color: "#94a3b8", margin: "4px 0 0 0" }}>
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div
              style={{
                position: "fixed",
                top: 20,
                right: 20,
                padding: "12px 20px",
                borderRadius: 10,
                background: "linear-gradient(135deg, rgba(34,197,94,0.9), rgba(16,185,129,0.9))",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                zIndex: 1000,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              {toast}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "250px 1fr",
              gap: 24,
            }}
          >
            {/* Sidebar Tabs */}
            <div
              style={{
                background: "rgba(15,23,42,0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(30,41,59,0.5)",
                borderRadius: 16,
                padding: 16,
                height: "fit-content",
                position: "sticky",
                top: 20,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: "none",
                      background: activeTab === tab.id ? "rgba(139,92,246,0.2)" : "transparent",
                      color: activeTab === tab.id ? "#c4b5fd" : "#94a3b8",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: activeTab === tab.id ? 600 : 500,
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.background = "rgba(139,92,246,0.1)";
                        e.currentTarget.style.color = "#cbd5e1";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#94a3b8";
                      }
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div
              style={{
                background: "rgba(15,23,42,0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(30,41,59,0.5)",
                borderRadius: 16,
                padding: 32,
              }}
            >
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Profile Information</h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={profile.specialization}
                        onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Hospital/Clinic
                      </label>
                      <input
                        type="text"
                        value={profile.hospital}
                        onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={4}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                          resize: "vertical",
                        }}
                      />
                    </div>
                    <button
                      onClick={handleProfileSave}
                      style={{
                        padding: "12px 24px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(139,92,246,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Preferences</h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Theme
                      </label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Date Format
                      </label>
                      <select
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <button
                      onClick={handlePreferencesSave}
                      style={{
                        padding: "12px 24px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Security Settings</h2>
                  <div style={{ display: "grid", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid rgba(30,41,59,0.5)",
                          background: "rgba(2,6,23,0.5)",
                          color: "white",
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <button
                      onClick={() => showToast("Password updated successfully!")}
                      style={{
                        padding: "12px 24px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Notification Preferences</h2>
                  <div style={{ display: "grid", gap: 16 }}>
                    {Object.entries(preferences.notifications).map(([key, value]) => (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "16px",
                          borderRadius: 10,
                          background: "rgba(30,41,59,0.3)",
                          border: "1px solid rgba(30,41,59,0.5)",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0", marginBottom: 4 }}>
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())
                              .trim()}
                          </div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            {key === "highRiskAlerts"
                              ? "Get notified when high-risk patients need attention"
                              : key === "appointmentReminders"
                              ? "Receive reminders before appointments"
                              : `Receive ${key} notifications`}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, [key]: !value },
                            })
                          }
                          style={{
                            width: 48,
                            height: 24,
                            borderRadius: 12,
                            border: "none",
                            background: value ? "rgba(34,197,94,0.8)" : "rgba(30,41,59,0.5)",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.2s",
                          }}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: "white",
                              position: "absolute",
                              top: 2,
                              left: value ? 26 : 2,
                              transition: "left 0.2s",
                            }}
                          />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handlePreferencesSave}
                      style={{
                        padding: "12px 24px",
                        borderRadius: 10,
                        border: "none",
                        background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default SettingsPage;

