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

import PostJob from "./pages/PostJob";
import PendingJobs from "./pages/PendingJobs";
import PendingBusinesses from "./pages/PendingBusinesses";
import Businesses from "./pages/Businesses";
import ApprovedBusinesses from "./pages/ApprovedBusinesses";
import Jobs from "./pages/Jobs";
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster position="top-right" />

        <Routes>

          {/* ================= AUTH ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ================= MAIN DASHBOARD REDIRECT ================= */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ================= JOB ROUTES ================= */}

          {/* Recruiter post job */}
          <Route
            path="/post-job"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <PostJob />
              </ProtectedRoute>
            }
          />

          {/* Admin approve jobs */}
          <Route
            path="/admin/pending-jobs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PendingJobs />
              </ProtectedRoute>
            }
          />

          {/* ================= BUSINESS ROUTES ================= */}

          {/* Admin approve businesses */}
          <Route
            path="/admin/pending-businesses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PendingBusinesses />
              </ProtectedRoute>
            }
          />

          {/* Public business listing */}
          <Route
            path="/businesses"
            element={<Businesses />}
          />
          
          {/* ================= ROLE DASHBOARDS ================= */}

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
<Route path="/jobs" element={<Jobs />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ================= PROFILE ================= */}
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/approved-businesses" element={<ApprovedBusinesses />} />
          {/* ================= DEFAULT ================= */}
          <Route path="/" element={<Navigate to="/login" replace />} />

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
