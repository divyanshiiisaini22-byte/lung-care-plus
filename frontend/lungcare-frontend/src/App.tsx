import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth
import LoginPage from "./pages/Auth/login";
import RegisterPage from "./pages/Auth/Register";

// Patient pages
import PatientDashboard from "./pages/Dashboard/Patient/Index";
import ScanUpload from "./pages/Dashboard/Patient/ScanUpload";
import MyAppointments from "./pages/Dashboard/Patient/MyAppointments";
import DoctorConnect from "./pages/Dashboard/Patient/DoctorConnect";

// Doctor pages
import DoctorDashboard from "./pages/Dashboard/Doctor/Index";
import PatientsPage from "./pages/Dashboard/Doctor/Patients";
import PatientDetailPage from "./pages/Dashboard/Doctor/PatientDetail";
import AnalyticsPage from "./pages/Dashboard/Doctor/Analytics";
import AppointmentsPage from "./pages/Dashboard/Doctor/Appointments";
import NotificationsPage from "./pages/Dashboard/Doctor/Notifications";
import SettingsPage from "./pages/Dashboard/Doctor/Settings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ──────────────── PATIENT ROUTES ──────────────── */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/scan"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <ScanUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/doctors"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <DoctorConnect />
              </ProtectedRoute>
            }
          />

          {/* ──────────────── DOCTOR ROUTES ──────────────── */}
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/patients/:id"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/analytics"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/notifications"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/settings"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
