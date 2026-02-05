import React from 'react';
import Navbar from '../components/common/Navbar';
import { Briefcase, FileText, User, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const JobSeekerDashboard = () => {

  const { user } = useAuth();
  const navigate = useNavigate();

  const resumeUrl = user?.jobSeekerProfile?.resume;
  const profileProgress = user?.profileProgress || 0;

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

  return (
    <div>
      <Navbar title="Job Seeker Dashboard" />

      <div className="container">
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
          Welcome {user?.name || "User"}
        </h2>

        {/* ✅ OPTIONAL REMINDER (no redirect) */}
        {!user?.profileCompleted && (
          <div style={{
            background: "#fff7ed",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "#9a3412"
          }}>
            Your profile is incomplete ({profileProgress}%).
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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={28} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS */}
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>
            Quick Actions
          </h3>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/complete-profile")}
            >
              Complete Profile
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

            <button className="btn btn-secondary">
              Browse Jobs
            </button>

          </div>

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
