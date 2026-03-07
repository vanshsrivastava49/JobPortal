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
    navigate('/');
  };

  const roleConfig = {
    admin:     { label: 'Admin',      bg: '#f3e8ff', color: '#7c3aed', border: '#ddd6fe' },
    recruiter: { label: 'Recruiter',  bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    business:  { label: 'Business',  bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
    jobseeker: { label: 'Job Seeker', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  };

  const role = roleConfig[user?.role] || roleConfig.jobseeker;

  const navLinks = {
    admin: [
      { label: 'Dashboard',  path: '/admin',                    icon: LayoutDashboard },
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
      { label: 'Jobs',      path: '/jobs',                icon: Briefcase },
      { label: 'Dashboard', path: '/jobseeker/dashboard', icon: LayoutDashboard },
    ],
  };

  const links = navLinks[user?.role] || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .nav-root {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
        }

        /* ── TOP ROW ── */
        .nav-top {
          border-bottom: 1px solid #ececec;
          width: 100%;
        }

        .nav-top-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: stretch;
          min-height: 90px;
        }

        /* Left: logo + company */
        .nav-brand-block {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 48px;
          flex-shrink: 0;
        }

        .nav-brand {
          cursor: pointer;
          text-decoration: none;
        }

        .nav-brand-text {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .nav-brand-text .green { color: #108a42; }
        .nav-brand-text .dark  { color: #1a1a1a; }

        .nav-divider-v {
          width: 1px;
          height: 40px;
          background: #ddd;
          flex-shrink: 0;
          align-self: center;
        }

        .nav-divider-v-full {
          width: 1px;
          background: #e8e8e8;
          flex-shrink: 0;
          align-self: stretch;
        }

        .nav-company-name {
          font-size: 13px;
          color: #444;
          font-weight: 500;
          white-space: nowrap;
        }

        /* Right: banner image area */
        .nav-banner-area {
          flex: 1;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          min-height: 90px;
        }

        .nav-banner-placeholder {
          position: absolute;
          inset: 8px;
          border: 2px dashed #c8d8c8;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .nav-banner-placeholder span {
          font-size: 11px;
          color: #999;
          font-weight: 500;
        }

        .nav-banner-placeholder small {
          font-size: 10px;
          color: #bbb;
        }

        /* ── BOTTOM ROW ── */
        .nav-bottom {
          width: 100%;
        }

        .nav-bottom-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 48px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-links-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Nav links */
        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #2b2b2b;
          cursor: pointer;
          background: none;
          border: none;
          text-decoration: none;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .nav-link:hover { color: #108a42; }

        .nav-link.active {
          color: #108a42;
          font-weight: 600;
        }

        /* User menu */
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

        /* Dropdown */
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

        .nav-overlay {
          position: fixed;
          inset: 0;
          z-index: 99;
        }

        @media (max-width: 768px) {
          .nav-brand-block { padding: 12px 20px; gap: 12px; }
          .nav-bottom-inner { padding: 0 20px; gap: 16px; }
          .nav-user-email { max-width: 110px; }
          .nav-company-name { display: none; }
          .nav-divider-v { display: none; }
        }

        /* ── Auth buttons (public/logged-out) ── */
        .nav-auth-btn {
          border-radius: 9999px;
          padding: 8px 26px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }

        .nav-auth-btn--outline {
          background: white;
          border: 1.5px solid #c8e6c9;
          color: #108a42;
        }

        .nav-auth-btn--outline:hover {
          background: #f0faf2;
        }

        .nav-auth-btn--solid {
          background: #9dffc1;
          border: none;
          color: #1a6b35;
        }

        .nav-auth-btn--solid:hover {
          background: #7dfaab;
        }
      `}</style>

      <nav className="nav-root">

        {/* ── TOP ROW: Logo + Company | Banner Image ── */}
        <div className="nav-top">
          <div className="nav-top-inner">

            {/* Left: GreenJobs + company */}
            <div className="nav-brand-block">
              <div className="nav-brand" onClick={() => navigate('/')}>
                <div className="nav-brand-text">
                  <span className="green">Green</span>
                  <span className="dark">Jobs</span>
                </div>
              </div>
              <div className="nav-divider-v" />
              <span className="nav-company-name">Renewables India Pvt Ltd</span>
            </div>

            {/* Separator */}
            <div className="nav-divider-v-full" />

            {/* Right: Banner image placeholder */}
            <div className="nav-banner-area">
              <div className="nav-banner-placeholder">
                <span>🖼️</span>
                <span>Banner image will be placed here</span>
                <small>Recommended size: 900 × 90 px</small>
              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="nav-bottom">
          <div className="nav-bottom-inner">

            {user ? (
              <>
                {/* Left: Role-based nav links */}
                <div className="nav-links-group">
                  {links.map(({ label, path, icon: Icon }) => (
                    <button
                      key={path}
                      className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                      onClick={() => navigate(path)}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Right: User dropdown */}
                <div className="nav-user-wrap">
                  <button
                    className="nav-user-btn"
                    onClick={() => setUserMenuOpen(v => !v)}
                  >
                    <div className="nav-avatar">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || <User size={13} />}
                    </div>
                    <div className="nav-user-info">
                      <span className="nav-user-email">{user?.name || user?.email}</span>
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
              </>
            ) : (
              <>
                {/* Public homepage: empty left, Login + Sign Up on right */}
                <div />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => navigate('/login')}
                    className="nav-auth-btn nav-auth-btn--outline"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="nav-auth-btn nav-auth-btn--solid"
                  >
                    Sign Up
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

      </nav>
    </>
  );
};

export default Navbar;