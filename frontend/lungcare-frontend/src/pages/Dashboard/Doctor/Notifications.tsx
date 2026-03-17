// src/pages/Dashboard/Doctor/Notifications.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../../../components/DoctorLayout";

type NotificationType = "alert" | "info" | "warning" | "success";
type NotificationPriority = "high" | "medium" | "low";

interface Notification {
  id: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  patientId?: number;
  patientName?: string;
  actionUrl?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "alert",
    priority: "high",
    title: "High Risk Patient Alert",
    message: "Rahul Singh's latest scan shows concerning changes. Immediate review recommended.",
    timestamp: "2025-11-21T10:30:00",
    read: false,
    patientId: 1,
    patientName: "Rahul Singh",
    actionUrl: "/dashboard/doctor/patients/1",
  },
  {
    id: 2,
    type: "warning",
    priority: "medium",
    title: "Follow-up Reminder",
    message: "Anjali Gupta has a scheduled follow-up appointment tomorrow at 11:30 AM.",
    timestamp: "2025-11-21T09:15:00",
    read: false,
    patientId: 2,
    patientName: "Anjali Gupta",
    actionUrl: "/dashboard/doctor/patients/2",
  },
  {
    id: 3,
    type: "info",
    priority: "low",
    title: "New Scan Uploaded",
    message: "Priya Sharma has uploaded a new CT scan. AI analysis pending.",
    timestamp: "2025-11-21T08:45:00",
    read: false,
    patientId: 4,
    patientName: "Priya Sharma",
    actionUrl: "/dashboard/doctor/patients/4",
  },
  {
    id: 4,
    type: "success",
    priority: "low",
    title: "Treatment Plan Updated",
    message: "Vikram Patel's treatment plan has been successfully updated.",
    timestamp: "2025-11-20T16:20:00",
    read: true,
    patientId: 3,
    patientName: "Vikram Patel",
    actionUrl: "/dashboard/doctor/patients/3",
  },
  {
    id: 5,
    type: "alert",
    priority: "high",
    title: "Urgent: Patient Response Needed",
    message: "Rajesh Kumar has not responded to follow-up requests. Please contact immediately.",
    timestamp: "2025-11-20T14:10:00",
    read: false,
    patientId: 5,
    patientName: "Rajesh Kumar",
    actionUrl: "/dashboard/doctor/patients/5",
  },
  {
    id: 6,
    type: "info",
    priority: "medium",
    title: "System Update",
    message: "New AI model version deployed. Improved accuracy for nodule detection.",
    timestamp: "2025-11-20T12:00:00",
    read: true,
  },
];

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread" | "alerts">("all");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (filter === "unread") return !notif.read;
      if (filter === "alerts") return notif.type === "alert" || notif.priority === "high";
      return true;
    });
  }, [notifications, filter]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case "alert":
        return { icon: "🚨", color: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.3)" };
      case "warning":
        return { icon: "⚠️", color: "#fbbf24", bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)" };
      case "info":
        return { icon: "ℹ️", color: "#3b82f6", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)" };
      case "success":
        return { icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)" };
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "high":
        return { label: "High", color: "#ef4444" };
      case "medium":
        return { label: "Medium", color: "#fbbf24" };
      case "low":
        return { label: "Low", color: "#94a3b8" };
    }
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <DoctorLayout>
      <div style={{ padding: "32px 24px", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle at 80% 20%, rgba(249,115,22,0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "1400px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  🔔
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      margin: 0,
                      background: "linear-gradient(135deg, #ffffff 0%, #fdba74 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Notifications
                  </h1>
                  <p style={{ fontSize: 14, color: "#94a3b8", margin: "4px 0 0 0" }}>
                    {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "1px solid rgba(59,130,246,0.3)",
                  background: "rgba(59,130,246,0.1)",
                  color: "#93c5fd",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(59,130,246,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(59,130,246,0.1)";
                }}
              >
                Mark All as Read
              </button>
            )}
          </div>

          {/* Filters */}
          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(30,41,59,0.5)",
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "All", value: "all" as const, count: notifications.length },
                { label: "Unread", value: "unread" as const, count: unreadCount },
                { label: "Alerts", value: "alerts" as const, count: notifications.filter((n) => n.type === "alert" || n.priority === "high").length },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: `1px solid ${filter === f.value ? "rgba(249,115,22,0.5)" : "rgba(30,41,59,0.5)"}`,
                    background: filter === f.value ? "rgba(249,115,22,0.2)" : "rgba(15,23,42,0.5)",
                    color: filter === f.value ? "#fdba74" : "#94a3b8",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {f.label}
                  {f.count > 0 && (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: filter === f.value ? "rgba(249,115,22,0.3)" : "rgba(30,41,59,0.5)",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(30,41,59,0.5)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            {filteredNotifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>No notifications found</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {filteredNotifications.map((notif) => {
                  const typeConfig = getTypeConfig(notif.type);
                  const priorityBadge = getPriorityBadge(notif.priority);
                  return (
                    <div
                      key={notif.id}
                      style={{
                        display: "flex",
                        gap: 16,
                        padding: "20px",
                        borderRadius: 12,
                        background: notif.read ? "rgba(30,41,59,0.3)" : "rgba(249,115,22,0.1)",
                        border: `1px solid ${notif.read ? "rgba(30,41,59,0.5)" : typeConfig.border}`,
                        opacity: notif.read ? 0.7 : 1,
                        transition: "all 0.2s",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = notif.read ? "rgba(30,41,59,0.5)" : "rgba(249,115,22,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = notif.read ? "rgba(30,41,59,0.3)" : "rgba(249,115,22,0.1)";
                      }}
                    >
                      {!notif.read && (
                        <div
                          style={{
                            position: "absolute",
                            left: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#f97316",
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: typeConfig.bg,
                          border: `1px solid ${typeConfig.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                          flexShrink: 0,
                        }}
                      >
                        {typeConfig.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>
                            {notif.title}
                          </h3>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: `rgba(${priorityBadge.color === "#ef4444" ? "239,68,68" : priorityBadge.color === "#fbbf24" ? "251,191,36" : "148,163,184"},0.2)`,
                              color: priorityBadge.color,
                            }}
                          >
                            {priorityBadge.label} Priority
                          </span>
                          {notif.patientName && (
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                background: "rgba(59,130,246,0.2)",
                                color: "#93c5fd",
                              }}
                            >
                              👤 {notif.patientName}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 14, color: "#cbd5e1", marginBottom: 8, lineHeight: 1.5 }}>
                          {notif.message}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#94a3b8" }}>
                          <span>🕐 {getRelativeTime(notif.timestamp)}</span>
                          {notif.actionUrl && (
                            <button
                              onClick={() => {
                                markAsRead(notif.id);
                                navigate(notif.actionUrl!);
                              }}
                              style={{
                                padding: "4px 12px",
                                borderRadius: 6,
                                border: "1px solid rgba(59,130,246,0.3)",
                                background: "rgba(59,130,246,0.1)",
                                color: "#93c5fd",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              View Details →
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              border: "1px solid rgba(59,130,246,0.3)",
                              background: "rgba(59,130,246,0.1)",
                              color: "#93c5fd",
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1px solid rgba(239,68,68,0.3)",
                            background: "rgba(239,68,68,0.1)",
                            color: "#fca5a5",
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default NotificationsPage;

