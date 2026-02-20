import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, ChevronDown, Briefcase, LayoutDashboard, Building, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const roleConfig = {
    admin:     { label: 'Admin',      bg: '#f3e8ff', color: '#7c3aed', border: '#ddd6fe' },
    recruiter: { label: 'Recruiter',  bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    business:  { label: 'Business',  bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
    jobseeker: { label: 'Job Seeker', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  };

  const role = roleConfig[user?.role] || roleConfig.jobseeker;

  // Nav links per role
  const navLinks = {
    admin: [
      { label: 'Dashboard',  path: '/admin',                   icon: LayoutDashboard },
      { label: 'Businesses', path: '/admin/pending-businesses', icon: Building },
    ],
    recruiter: [
      { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
      { label: 'Post Job',  path: '/recruiter/post-job',  icon: Briefcase },
    ],
    business: [
      { label: 'Dashboard', path: '/business/dashboard', icon: LayoutDashboard },
      { label: 'Requests',  path: '/business/requests',  icon: Clock },
    ],
    jobseeker: [
      { label: 'Jobs',      path: '/jobs',               icon: Briefcase },
      { label: 'Dashboard', path: '/jobseeker/dashboard', icon: LayoutDashboard },
    ],
  };

  const links = navLinks[user?.role] || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .nav-root {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'DM Sans', sans-serif;
        }

        .nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 62px;
          gap: 24px;
        }

        /* ── Brand ── */
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none;
          flex-shrink: 0;
        }

        .nav-brand-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(16,185,129,0.3);
        }

        .nav-brand-text {
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        /* ── Links ── */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          background: none;
          border: none;
          text-decoration: none;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .nav-link.active {
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 600;
        }

        /* ── Right side ── */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* ── User menu ── */
        .nav-user-wrap {
          position: relative;
        }

        .nav-user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px 6px 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .nav-user-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .nav-avatar {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 12px;
          flex-shrink: 0;
        }

        .nav-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1px;
        }

        .nav-user-email {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nav-role-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.3px;
          padding: 1px 7px;
          border-radius: 4px;
        }

        .nav-chevron {
          color: #94a3b8;
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .nav-chevron.open { transform: rotate(180deg); }

        /* ── Dropdown ── */
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          min-width: 200px;
          overflow: hidden;
          animation: dropIn 0.15s ease;
          z-index: 200;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nav-dropdown-header {
          padding: 14px 16px 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .nav-dropdown-name {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .nav-dropdown-email {
          font-size: 12px;
          color: #64748b;
          word-break: break-all;
        }

        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 11px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s;
          font-family: 'DM Sans', sans-serif;
        }

        .nav-dropdown-item:hover { background: #f8fafc; }

        .nav-dropdown-item.danger {
          color: #dc2626;
          border-top: 1px solid #f1f5f9;
        }
        .nav-dropdown-item.danger:hover { background: #fef2f2; }

        /* ── Overlay to close dropdown ── */
        .nav-overlay {
          position: fixed;
          inset: 0;
          z-index: 99;
        }

        @media (max-width: 640px) {
          .nav-links { display: none; }
          .nav-user-email { max-width: 110px; }
          .nav-inner { padding: 0 16px; }
        }
      `}</style>

      <nav className="nav-root">
        <div className="nav-inner">

          {/* Brand */}
          <div className="nav-brand" onClick={() => navigate('/')}>
            <span className="nav-brand-text">{title || 'Green Jobs'}</span>
          </div>

          {/* Right */}
          <div className="nav-right">
            <div className="nav-user-wrap">
              <button
                className="nav-user-btn"
                onClick={() => setUserMenuOpen(v => !v)}
              >
                <div className="nav-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || <User size={13} />}
                </div>
                <div className="nav-user-info">
                  <span className="nav-user-email">
                    {user?.name || user?.email}
                  </span>
                  <span
                    className="nav-role-badge"
                    style={{ background: role.bg, color: role.color, border: `1px solid ${role.border}` }}
                  >
                    {role.label}
                  </span>
                </div>
                <ChevronDown size={14} className={`nav-chevron ${userMenuOpen ? 'open' : ''}`} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="nav-overlay" onClick={() => setUserMenuOpen(false)} />
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      <div className="nav-dropdown-name">{user?.name || 'User'}</div>
                      <div className="nav-dropdown-email">{user?.email}</div>
                    </div>

                    <button
                      className="nav-dropdown-item"
                      onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                    >
                      <User size={15} />
                      My Profile
                    </button>

                    <button
                      className="nav-dropdown-item danger"
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </nav>
    </>
  );
};

export default Navbar;