import React from 'react';
import Navbar from '../components/common/Navbar';
import { Users, Briefcase, Building, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { icon: Users, label: 'Total Users', value: '0', color: '#2563eb' },
    { icon: Briefcase, label: 'Total Jobs', value: '0', color: '#16a34a' },
    { icon: Building, label: 'Business Listings', value: '0', color: '#ea580c' },
    { icon: TrendingUp, label: 'Platform Growth', value: '0%', color: '#7c3aed' },
  ];

  return (
    <div>
      <Navbar title="Admin Dashboard" />
      
      <div className="container">
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Welcome to Admin Dashboard</h2>
        
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
            <button className="btn btn-primary">Manage Users</button>
            <button className="btn btn-secondary">Approve Listings</button>
            <button className="btn btn-secondary">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;