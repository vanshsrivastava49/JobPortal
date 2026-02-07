import React from 'react';
import Navbar from '../components/common/Navbar';
import { Building, Users, Eye, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BusinessOwnerDashboard = () => {

  const { user } = useAuth();

  const images = user?.businessProfile?.images || [];

  const stats = [
    { icon: Building, label: 'Active Listings', value: '0', color: '#2563eb' },
    { icon: Users, label: 'Total Views', value: '0', color: '#16a34a' },
    { icon: Eye, label: 'Profile Views', value: '0', color: '#ea580c' },
    { icon: TrendingUp, label: 'Leads This Month', value: '0', color: '#7c3aed' },
  ];

  return (
    <div>
      <Navbar title="Business Owner Dashboard" />

      <div className="container">
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
          Welcome {user?.name || "Business Owner"}
        </h2>

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

        {/* ===== QUICK ACTIONS ===== */}
        <div className="card">
          <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>
            Quick Actions
          </h3>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary">
              Add Business Listing
            </button>
            <button className="btn btn-secondary">
              View Leads
            </button>
            <button className="btn btn-secondary">
              Manage Listings
            </button>
          </div>
        </div>

        {/* ===== BUSINESS IMAGES ===== */}
        <div className="card" style={{ marginTop: 30 }}>
          <h3 style={{ marginBottom: 15 }}>
            Your Business Images
          </h3>

          {images.length === 0 ? (
            <p style={{ color:"#6b7280" }}>
              No images uploaded yet.
            </p>
          ) : (
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',
              gap:'15px'
            }}>
              {images.map((img,i)=>(
                <img
                  key={i}
                  src={img}
                  alt="business"
                  onClick={()=>window.open(img,"_blank")}
                  style={{
                    width:'100%',
                    height:'150px',
                    objectFit:'cover',
                    borderRadius:'10px',
                    cursor:'pointer',
                    border:'1px solid #e5e7eb'
                  }}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BusinessOwnerDashboard;
