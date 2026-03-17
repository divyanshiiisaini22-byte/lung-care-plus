import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  allowedRoles: ("doctor" | "patient")[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    // Redirect to the right home for their role
    return <Navigate to={role === "doctor" ? "/dashboard/doctor" : "/patient/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
