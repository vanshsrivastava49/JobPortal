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
import Myprofile from "./pages/Myprofile";
import PostJob from "./pages/PostJob";
import PendingJobs from "./pages/PendingJobs";
import PendingBusinesses from "./pages/PendingBusinesses";
import Businesses from "./pages/Businesses";
import ApprovedBusinesses from "./pages/ApprovedBusinesses";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Home from "./pages/Home";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Myprofile />} />
          <Route path="/jobs/:jobId" element={<JobDetail />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/jobs" element={<Jobs />} />

          <Route
            path="/post-job"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <PostJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/pending-jobs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PendingJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/pending-businesses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PendingBusinesses />
              </ProtectedRoute>
            }
          />

          <Route path="/businesses" element={<Businesses />} />
          <Route path="/admin/approved-businesses" element={<ApprovedBusinesses />} />

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

          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;