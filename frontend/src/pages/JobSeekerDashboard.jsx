import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import { Briefcase, FileText, User, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const resumeUrl = user?.jobSeekerProfile?.resume;
  const profileProgress = user?.profileProgress || 0;
  const profile = user?.jobSeekerProfile || {};
  const isProfileComplete = user?.profileCompleted;

  const stats = [
    { icon: Briefcase, label: 'Jobs Applied', value: '0', color: '#2563eb' },
    { icon: FileText, label: 'Profile Views', value: '0', color: '#16a34a' },
    { icon: TrendingUp, label: 'Shortlisted', value: '0', color: '#ea580c' },
    { icon: User, label: 'Profile Completion', value: `${profileProgress}%`, color: '#7c3aed' },
  ];

  const handleViewResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    }
  };

  // 🔥 NEW: Browse Jobs handler
  const handleBrowseJobs = () => {
    navigate("/jobs");
  };

  return (
    <div>
      <Navbar title="Job Seeker Dashboard" />

      <div className="container">
        <h2 style={{ marginBottom: "20px", color: "#1f2937" }}>
          Welcome {user?.name || "User"}
        </h2>

        {/* PROFILE REMINDER */}
        {!isProfileComplete && (
          <div style={{
            background: "#fff7ed",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "#9a3412",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>Your profile is incomplete ({profileProgress}%).</span>
            <button
              className="btn btn-primary"
              style={{ marginLeft: 10 }}
              onClick={() => navigate("/complete-profile")}
            >
              Complete Now
            </button>
          </div>
        )}

        {/* STATS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card" style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "20px"
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "12px",
                  background: `${stat.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Icon size={28} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS - 🔥 FIXED WITH JOBS BUTTON */}
        <div className="card" style={{ marginBottom: 30 }}>
          <h3 style={{ marginBottom: "15px", color: "#1f2937" }}>Quick Actions</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            
            {/* ✅ Dynamic Profile Button */}
            <button
              className="btn btn-primary"
              onClick={() => navigate("/complete-profile")}
            >
              {isProfileComplete ? "Update Profile" : "Complete Profile"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "View Saved Details"}
            </button>

            {resumeUrl ? (
              <button
                className="btn btn-secondary"
                onClick={handleViewResume}
              >
                View Resume
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/complete-profile")}
              >
                Upload Resume
              </button>
            )}

            {/* 🔥 NEW: Browse Jobs Button */}
            <button 
              className="btn btn-primary" 
              style={{ 
                background: "#10b981", 
                borderColor: "#10b981",
                fontWeight: "bold",
                padding: "12px 24px"
              }}
              onClick={handleBrowseJobs}
            >
              🚀 Browse Jobs
            </button>

          </div>

          {/* PROFILE DETAILS SECTION */}
          {showDetails && (
            <div style={{
              marginTop: 20,
              padding: 15,
              background: "#f9fafb",
              borderRadius: 8
            }}>
              <h4 style={{ marginBottom: 10 }}>Saved Details</h4>

              <p><b>Full Name:</b> {profile.fullName || "-"}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>Mobile:</b> {profile.mobile || "-"}</p>
              <p><b>City:</b> {profile.city || "-"}</p>
              <p><b>Education:</b> {profile.education || "-"}</p>
              <p><b>Skills:</b> {profile.skills?.join(", ") || "-"}</p>

              {resumeUrl && (
                <p>
                  <b>Resume:</b>{" "}
                  <a href={resumeUrl} target="_blank" rel="noreferrer">
                    View Resume
                  </a>
                </p>
              )}
            </div>
          )}

          {/* RESUME STATUS */}
          <p style={{ marginTop: 15, color: "#6b7280" }}>
            Resume Status:{" "}
            {resumeUrl ? (
              <span style={{color:"green"}}>Uploaded ✅</span>
            ) : (
              <span style={{color:"red"}}>Not Uploaded ❌</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
