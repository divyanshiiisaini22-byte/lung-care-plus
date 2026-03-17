// src/components/DoctorLayout.tsx
import React from "react";
import Sidebar from "./Sidebar";

interface DoctorLayoutProps {
  children: React.ReactNode;
}

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
};

export default DoctorLayout;

