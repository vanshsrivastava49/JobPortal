import React from 'react';
import Navbar from '../components/common/Navbar';
import { Briefcase, Users, Eye, TrendingUp } from 'lucide-react';

const RecruiterDashboard = () => {
  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: '0', color: '#2563eb' },
    { icon: Users, label: 'Total Applications', value: '0', color: '#16a34a' },
    { icon: Eye, label: 'Profile Views', value: '0', color: '#ea580c' },
    { icon: TrendingUp, label: 'Hires This Month', value: '0', color: '#7c3aed' },
  ];

  return (
    <div>
      <Navbar title="Recruiter Dashboard" />
      <div className="container">
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Welcome to Your Dashboard</h2>
        
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

        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary">Post New Job</button>
            <button className="btn btn-secondary">View Applications</button>
            <button className="btn btn-secondary">Manage Jobs</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;