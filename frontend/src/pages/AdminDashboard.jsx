import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { Users, Briefcase, Building, TrendingUp, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [statsData, setStatsData] = useState({
    users: "—",
    jobs: 0,
    companies: 0,
    growth: "—",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const jobsRes = await axios.get(
        "http://localhost:5000/api/jobs/pending",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const bizRes = await axios.get(
        "http://localhost:5000/api/profile/business/pending",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatsData({
        users: "—",
        jobs: jobsRes.data.length || 0,
        companies: bizRes.data.length || 0,
        growth: "+12%",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const stats = [
    { icon: Users, label: "Total Users", value: statsData.users, color: "#3b82f6" },
    { icon: Briefcase, label: "Pending Jobs", value: statsData.jobs, color: "#10b981" },
    { icon: Building, label: "Pending Businesses", value: statsData.companies, color: "#f59e0b" },
    { icon: TrendingUp, label: "Platform Growth", value: statsData.growth, color: "#8b5cf6" },
  ];

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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
          text-align: center;
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

        .info-note {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          font-size: 13px;
          color: #1e40af;
          margin-top: 16px;
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
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Manage users, approve businesses, and monitor platform activity
            </p>
          </div>

          <div className="stats-grid">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="stat-card">
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
                className="btn btn-primary"
                onClick={() => navigate("/admin/pending-jobs")}
              >
                <Briefcase size={16} />
                Approve Jobs ({statsData.jobs})
              </button>

              <button
                className="btn btn-primary"
                onClick={() => navigate("/admin/pending-businesses")}
              >
                <Building size={16} />
                Approve Businesses ({statsData.companies})
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => navigate("/admin/users")}
              >
                <Users size={16} />
                Manage Users
              </button>

              <button
                className="btn btn-success"
                onClick={() => navigate("/admin/approved-businesses")}
              >
                <CheckCircle size={16} />
                View Approved Businesses
              </button>
            </div>

            <div className="info-note">
              <TrendingUp size={16} />
              <span>Moderate listings to maintain platform quality and ensure compliance</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;