import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import { 
  Briefcase, 
  FileText, 
  User, 
  TrendingUp, 
  Upload, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react';
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
    { icon: Briefcase, label: 'Jobs Applied', value: '0', color: '#3b82f6' },
    { icon: FileText, label: 'Profile Views', value: '0', color: '#10b981' },
    { icon: TrendingUp, label: 'Shortlisted', value: '0', color: '#8b5cf6' },
    { icon: User, label: 'Profile Completion', value: `${profileProgress}%`, color: '#f59e0b' },
  ];

  const handleViewResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    }
  };

  const handleBrowseJobs = () => {
    navigate("/jobs");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f8fafc;
          color: #0f172a;
        }

        .dashboard-wrapper {
          background: #f8fafc;
          min-height: 100vh;
        }

        .dashboard-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 15px;
          color: #64748b;
          font-weight: 400;
        }

        .alert-banner {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .alert-banner.warning {
          background: #fffbeb;
          border-color: #fde047;
        }

        .alert-banner.success {
          background: #f0fdf4;
          border-color: #86efac;
        }

        .alert-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .alert-description {
          font-size: 13px;
          color: #64748b;
        }

        .alert-action {
          flex-shrink: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
          line-height: 1;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .section-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .action-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          outline: none;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: white;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 6px;
          margin-top: 16px;
        }

        .detail-item-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .detail-item-value {
          font-size: 14px;
          color: #0f172a;
          font-weight: 500;
        }

        .resume-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          margin-top: 16px;
        }

        .resume-status.uploaded {
          background: #f0fdf4;
          border-color: #86efac;
          color: #065f46;
        }

        .resume-status.not-uploaded {
          background: #fef2f2;
          border-color: #fecaca;
          color: #991b1b;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-tag {
          padding: 6px 12px;
          background: #eff6ff;
          color: #1e40af;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px;
          }

          .page-title {
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .action-group {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Navbar />

      <div className="dashboard-wrapper">
        <div className="dashboard-container">
          <div className="page-header">
            <h1 className="page-title">
              Welcome back, {user?.name?.split(" ")[0] || "User"}
            </h1>
            <p className="page-subtitle">
              Track your applications, manage your profile, and discover new opportunities
            </p>
          </div>

          {!isProfileComplete && (
            <div className="alert-banner warning">
              <div className="alert-icon">
                <AlertCircle size={20} color="#f59e0b" />
              </div>
              <div className="alert-content">
                <div className="alert-title">
                  Complete Your Profile ({profileProgress}%)
                </div>
                <div className="alert-description">
                  Finish setting up your profile to get noticed by recruiters
                </div>
              </div>
              <div className="alert-action">
                <button
                  onClick={() => navigate("/complete-profile")}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  Complete Now
                </button>
              </div>
            </div>
          )}

          <div className="stats-grid">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon">
                      <Icon size={20} color={stat.color} />
                    </div>
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>

            <div className="action-group">
              <button
                className="btn btn-success"
                onClick={handleBrowseJobs}
              >
                <Search size={16} />
                Browse Jobs
              </button>

              <button
                className="btn btn-primary"
                onClick={() => navigate("/complete-profile")}
              >
                <User size={16} />
                {isProfileComplete ? "Update Profile" : "Complete Profile"}
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Eye size={16} />
                {showDetails ? "Hide Details" : "View Details"}
              </button>

              {resumeUrl ? (
                <button
                  className="btn btn-secondary"
                  onClick={handleViewResume}
                >
                  <FileText size={16} />
                  View Resume
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/complete-profile")}
                >
                  <Upload size={16} />
                  Upload Resume
                </button>
              )}
            </div>

            {showDetails && (
              <div className="details-grid">
                <div>
                  <div className="detail-item-label">Full Name</div>
                  <div className="detail-item-value">
                    {profile.fullName || "—"}
                  </div>
                </div>
                <div>
                  <div className="detail-item-label">Email</div>
                  <div className="detail-item-value">{user.email}</div>
                </div>
                <div>
                  <div className="detail-item-label">Mobile</div>
                  <div className="detail-item-value">
                    {profile.mobile || "—"}
                  </div>
                </div>
                <div>
                  <div className="detail-item-label">City</div>
                  <div className="detail-item-value">{profile.city || "—"}</div>
                </div>
                <div>
                  <div className="detail-item-label">Education</div>
                  <div className="detail-item-value">
                    {profile.education || "—"}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="detail-item-label">Skills</div>
                  {profile.skills?.length > 0 ? (
                    <div className="skills-list" style={{ marginTop: '8px' }}>
                      {profile.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="detail-item-value">—</div>
                  )}
                </div>
              </div>
            )}

            <div className={`resume-status ${resumeUrl ? 'uploaded' : 'not-uploaded'}`}>
              {resumeUrl ? (
                <>
                  <CheckCircle size={16} />
                  <span><strong>Resume Status:</strong> Uploaded</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span><strong>Resume Status:</strong> Not Uploaded</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobSeekerDashboard;