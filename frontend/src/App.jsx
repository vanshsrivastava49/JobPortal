import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import BusinessOwnerDashboard from "./pages/BusinessOwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CompleteProfile from "./pages/CompleteProfile";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster position="top-right" />

        <Routes>
          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ROLE-BASED ROUTES */}
          <Route
            path="/jobseeker/*"
            element={
              <ProtectedRoute allowedRoles={["jobseeker"]}>
                <JobSeekerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/*"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/business/*"
            element={
              <ProtectedRoute allowedRoles={["business"]}>
                <BusinessOwnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/complete-profile" element={<CompleteProfile />} />

          {/* DEFAULT */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
