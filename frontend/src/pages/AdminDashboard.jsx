import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { Users, Briefcase, Building, TrendingUp } from "lucide-react";
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
      // ✅ Fixed: Correct profile API endpoints
      const jobsRes = await axios.get(
        "http://localhost:5000/api/jobs/pending",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const bizRes = await axios.get(
        "http://localhost:5000/api/profile/business/pending", // ✅ Fixed endpoint
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
    { icon: Users, label: "Total Users", value: statsData.users, color: "#2563eb" },
    { icon: Briefcase, label: "Pending Jobs", value: statsData.jobs, color: "#16a34a" },
    { icon: Building, label: "Pending Businesses", value: statsData.companies, color: "#ea580c" },
    { icon: TrendingUp, label: "Platform Growth", value: statsData.growth, color: "#7c3aed" },
  ];

  return (
    <div>
      <Navbar title="Admin Dashboard" />

      <div className="container">
        <h2 style={{ marginBottom: 20, color: "#1f2937" }}>
          Welcome to Admin Dashboard
        </h2>

        {/* STATS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          marginBottom: 30,
        }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card" style={{ display: "flex", gap: 15 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  background: `${stat.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Icon size={28} color={stat.color} />
                </div>

                <div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 14, color: "#6b7280" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS */}
        <div className="card">
          <h3 style={{ marginBottom: 15 }}>Quick Actions</h3>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/pending-jobs")}
            >
              Approve Jobs ({statsData.jobs})
            </button>

            <button
              className="btn btn-primary"
              onClick={() => navigate("/admin/pending-businesses")}
            >
              Approve Businesses ({statsData.companies})
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => navigate("/admin/users")}
            >
              Manage Users
            </button>
            <button
  className="btn btn-success"
  onClick={() => navigate("/admin/approved-businesses")}
>
  View Approved Businesses
</button>
          </div>

          <p style={{ marginTop: 15, color: "#6b7280" }}>
            Moderate listings to maintain platform quality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
