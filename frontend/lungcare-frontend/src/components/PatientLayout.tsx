import React from "react";
import PatientSidebar from "./PatientSidebar";

interface Props {
  children: React.ReactNode;
}

const PatientLayout: React.FC<Props> = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080e1a" }}>
      <PatientSidebar />
      <main style={{ flex: 1, overflowX: "hidden" }}>
        {children}
      </main>
    </div>
  );
};

export default PatientLayout;
