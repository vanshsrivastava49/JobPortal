import React from "react";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Globe, Linkedin, FileText, Building2, Clock, CheckCircle,
  Edit, ExternalLink, Shield, Tag, Image, DollarSign,
  Award, Star, BarChart2
} from "lucide-react";

export default function MyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = user?.role;
  const profile =
  role === "jobseeker" ? (user?.jobSeekerProfile || {}) :
  role === "recruiter" ? (user?.recruiterProfile || {}) :
  role === "business"  ? (user?.businessProfile  || {}) :
  {};

  // ── Helpers ──────────────────────────────────────────────────────────────
  const Field = ({ label, value, icon: Icon, isLink, multiline }) => (
    <div className="mp-field">
      <div className="mp-field-label">
        {Icon && <Icon size={11} />}
        {label}
      </div>
      <div className={`mp-field-value ${multiline ? "multiline" : ""}`}>
        {value ? (
          isLink ? (
            <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noreferrer">
              {value} <ExternalLink size={11} style={{ display: "inline", marginLeft: 2 }} />
            </a>
          ) : (
            value
          )
        ) : (
          <span className="mp-empty">Not provided</span>
        )}
      </div>
    </div>
  );

  const Section = ({ title, icon: Icon, color, children }) => (
    <div className="mp-section">
      <div className="mp-section-header" style={{ borderLeftColor: color }}>
        <div className="mp-section-icon" style={{ background: `${color}18` }}>
          <Icon size={16} color={color} />
        </div>
        <span className="mp-section-title">{title}</span>
      </div>
      <div className="mp-section-body">{children}</div>
    </div>
  );

  // ── Role config ───────────────────────────────────────────────────────────
  const roleConfig = {
    admin:     { label: "Admin",      bg: "#f3e8ff", color: "#7c3aed", border: "#ddd6fe" },
    recruiter: { label: "Recruiter",  bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
    business:  { label: "Business",   bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
    jobseeker: { label: "Job Seeker", bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
  };
  const rc = roleConfig[role] || roleConfig.jobseeker;

  // ── Edit route per role ───────────────────────────────────────────────────
  const editRoute = role === "admin" ? null : "/complete-profile";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mp-page {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: #0f172a;
        }

        .mp-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 36px 24px 64px;
        }

        /* ── Hero card ── */
        .mp-hero {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }

        .mp-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981);
        }

        .mp-avatar {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(102,126,234,0.3);
        }

        .mp-hero-info {
          flex: 1;
          min-width: 180px;
        }

        .mp-name {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .mp-email {
          font-size: 14px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .mp-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        .mp-hero-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .mp-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .mp-edit-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .mp-edit-btn:hover { background: #2563eb; transform: translateY(-1px); }

        /* ── Progress bar ── */
        .mp-progress-wrap {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }
        .mp-progress-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
        }
        .mp-progress-bg {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }
        .mp-progress-fill {
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.6s ease;
        }

        /* ── Sections ── */
        .mp-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          margin-bottom: 20px;
          overflow: hidden;
          animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mp-section:nth-child(1) { animation-delay: 0.05s; }
        .mp-section:nth-child(2) { animation-delay: 0.10s; }
        .mp-section:nth-child(3) { animation-delay: 0.15s; }
        .mp-section:nth-child(4) { animation-delay: 0.20s; }

        .mp-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          border-left: 4px solid transparent;
        }

        .mp-section-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mp-section-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .mp-section-body {
          padding: 4px 0;
        }

        /* ── Fields grid ── */
        .mp-fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }

        .mp-field {
          padding: 14px 20px;
          border-bottom: 1px solid #f8fafc;
        }
        .mp-field:last-child { border-bottom: none; }

        .mp-field-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }

        .mp-field-value {
          font-size: 14px;
          color: #0f172a;
          font-weight: 500;
          word-break: break-word;
        }

        .mp-field-value.multiline {
          font-weight: 400;
          color: #334155;
          line-height: 1.65;
          white-space: pre-wrap;
        }

        .mp-field-value a {
          color: #3b82f6;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .mp-field-value a:hover { text-decoration: underline; }

        .mp-empty {
          color: #cbd5e1;
          font-style: italic;
          font-size: 13px;
          font-weight: 400;
        }

        /* ── Skills ── */
        .mp-skills-wrap {
          padding: 16px 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .mp-skill {
          padding: 5px 14px;
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        /* ── Business images ── */
        .mp-images-grid {
          padding: 16px 20px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }

        .mp-biz-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mp-biz-img:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        /* ── Admin card ── */
        .mp-admin-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          margin-bottom: 20px;
        }

        .mp-admin-icon {
          width: 56px;
          height: 56px;
          background: #f3e8ff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .mp-admin-note {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 8px;
        }

        @media (max-width: 640px) {
          .mp-hero { flex-direction: column; align-items: flex-start; }
          .mp-hero-right { align-items: flex-start; }
          .mp-fields-grid { grid-template-columns: 1fr; }
          .mp-container { padding: 20px 16px 48px; }
        }
      `}</style>

      <Navbar />

      <div className="mp-page">
        <div className="mp-container">

          {/* ── Hero ── */}
          <div className="mp-hero">
            <div className="mp-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="mp-hero-info">
              <div className="mp-name">{user?.name || "User"}</div>
              <div className="mp-email">
                <Mail size={13} />
                {user?.email}
              </div>
              <span
                className="mp-role-badge"
                style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}
              >
                <Shield size={11} />
                {rc.label}
              </span>

              {/* Progress bar for non-admin */}
              {role !== "admin" && (
                <div className="mp-progress-wrap">
                  <div className="mp-progress-label">
                    <span>Profile Completion</span>
                    <span>{user?.profileProgress || 0}%</span>
                  </div>
                  <div className="mp-progress-bg">
                    <div className="mp-progress-fill" style={{ width: `${user?.profileProgress || 0}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="mp-hero-right">
              {/* Status badge */}
              {role !== "admin" && (
                user?.profileCompleted ? (
                  <span className="mp-status-pill" style={{ background: "#f0fdf4", color: "#15803d" }}>
                    <CheckCircle size={14} /> Profile Complete
                  </span>
                ) : (
                  <span className="mp-status-pill" style={{ background: "#fefce8", color: "#a16207" }}>
                    <Clock size={14} /> Incomplete
                  </span>
                )
              )}

              {/* Business status badge */}
              {role === "business" && (
                <span
                  className="mp-status-pill"
                  style={{
                    background: user?.businessProfile?.status === "approved" ? "#f0fdf4" : "#fef2f2",
                    color:      user?.businessProfile?.status === "approved" ? "#15803d" : "#dc2626",
                  }}
                >
                  {user?.businessProfile?.status === "approved"
                    ? <><CheckCircle size={14} /> Verified</>
                    : <><Clock size={14} /> Pending Approval</>}
                </span>
              )}

              {/* Edit button */}
              {editRoute && (
                <button className="mp-edit-btn" onClick={() => navigate(editRoute)}>
                  <Edit size={15} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════
              ADMIN — only name + email (shown in hero above)
          ════════════════════════════════════════════════════════ */}
          {role === "admin" && (
            <div className="mp-admin-card">
              <div className="mp-admin-icon">
                <Shield size={26} color="#7c3aed" />
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#0f172a", marginBottom: 6 }}>
                Administrator Account
              </div>
              <div className="mp-admin-note">
                Admin accounts display name and email only. No additional profile details are collected.
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              JOB SEEKER
          ════════════════════════════════════════════════════════ */}
          {role === "jobseeker" && (
            <>
              <Section title="Personal Information" icon={User} color="#3b82f6">
                <div className="mp-fields-grid">
                  <Field label="Full Name"  value={profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim()} icon={User} />
                  <Field label="Mobile"     value={profile.mobile}    icon={Phone} />
                  <Field label="City"       value={profile.city}      icon={MapPin} />
                  <Field label="Pincode"    value={profile.pincode}   icon={MapPin} />
                  <Field label="Email"      value={user?.email}       icon={Mail} />
                </div>
              </Section>

              <Section title="Professional Details" icon={Briefcase} color="#8b5cf6">
                <div className="mp-fields-grid">
                  <Field label="Education"        value={profile.education}     icon={GraduationCap} />
                  <Field label="Experience"        value={profile.experience ? `${profile.experience} years` : null} icon={Clock} />
                  <Field label="Preferred Role"    value={profile.preferredRole} icon={Star} />
                  <Field label="Expected Salary"   value={profile.expectedSalary} icon={DollarSign} />
                  <Field label="LinkedIn"          value={profile.linkedin}      icon={Linkedin} isLink />
                  <Field label="Portfolio"         value={profile.portfolio}     icon={Globe}    isLink />
                </div>
              </Section>

              {(profile.about || profile.accomplishments) && (
                <Section title="About" icon={FileText} color="#10b981">
                  <div style={{ padding: "4px 0" }}>
                    <Field label="About Me"        value={profile.about}           multiline />
                    <Field label="Accomplishments"  value={profile.accomplishments} multiline />
                  </div>
                </Section>
              )}

              {profile.skills?.length > 0 && (
                <Section title="Skills" icon={Award} color="#f59e0b">
                  <div className="mp-skills-wrap">
                    {profile.skills.map((s, i) => (
                      <span key={i} className="mp-skill">{s}</span>
                    ))}
                  </div>
                </Section>
              )}

              {profile.resume && (
                <Section title="Resume" icon={FileText} color="#06b6d4">
                  <div style={{ padding: "16px 20px" }}>
                    <a
                      href={profile.resume}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "10px 18px", background: "#f0fdf4",
                        color: "#15803d", border: "1px solid #bbf7d0",
                        borderRadius: 10, fontWeight: 600, fontSize: 14,
                        textDecoration: "none"
                      }}
                    >
                      <FileText size={15} /> View Resume <ExternalLink size={13} />
                    </a>
                  </div>
                </Section>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════
              RECRUITER
          ════════════════════════════════════════════════════════ */}
          {role === "recruiter" && (
            <>
              <Section title="Company Information" icon={Building2} color="#3b82f6">
                <div className="mp-fields-grid">
                  <Field label="Company Name"     value={profile.companyName}        icon={Building2} />
                  <Field label="Industry"         value={profile.industryType}       icon={Tag} />
                  <Field label="Location"         value={profile.companyLocation}    icon={MapPin} />
                  <Field label="Contact Number"   value={profile.contactNumber}      icon={Phone} />
                  <Field label="Website"          value={profile.companyWebsite}     icon={Globe} isLink />
                </div>
              </Section>

              {profile.companyDescription && (
                <Section title="About the Company" icon={FileText} color="#8b5cf6">
                  <div style={{ padding: "4px 0" }}>
                    <Field label="Description" value={profile.companyDescription} multiline />
                  </div>
                </Section>
              )}

              <Section title="Business Link" icon={CheckCircle} color="#10b981">
                <div className="mp-fields-grid">
                  <Field
                    label="Linked Business"
                    value={profile.linkedBusiness ? "Linked ✓" : null}
                    icon={Building2}
                  />
                  {!profile.linkedBusiness && (
                    <div style={{ padding: "14px 20px" }}>
                      <span className="mp-empty">Not linked to a business yet</span>
                    </div>
                  )}
                </div>
              </Section>

              {profile.companyLogo && (
                <Section title="Company Logo" icon={Image} color="#f59e0b">
                  <div style={{ padding: "16px 20px" }}>
                    <img
                      src={profile.companyLogo}
                      alt="Company logo"
                      style={{ height: 80, borderRadius: 10, border: "1px solid #e2e8f0", objectFit: "contain", background: "#f8fafc", padding: 8 }}
                    />
                  </div>
                </Section>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════
              BUSINESS OWNER
          ════════════════════════════════════════════════════════ */}
          {role === "business" && (
            <>
              <Section title="Business Information" icon={Building2} color="#10b981">
                <div className="mp-fields-grid">
                  <Field label="Business Name" value={profile.businessName} icon={Building2} />
                  <Field label="Category"      value={profile.category}     icon={Tag} />
                  <Field label="Address"       value={profile.address}      icon={MapPin} />
                  <Field label="Contact"       value={profile.contactDetails} icon={Phone} />
                </div>
              </Section>

              {profile.description && (
                <Section title="About the Business" icon={FileText} color="#3b82f6">
                  <div style={{ padding: "4px 0" }}>
                    <Field label="Description" value={profile.description} multiline />
                  </div>
                </Section>
              )}

              <Section title="Verification Status" icon={Shield} color="#8b5cf6">
                <div className="mp-fields-grid">
                  <Field
                    label="Status"
                    value={profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : null}
                    icon={BarChart2}
                  />
                  <Field
                    label="Verified"
                    value={profile.verified ? "Yes ✓" : "Not yet"}
                    icon={CheckCircle}
                  />
                </div>
              </Section>

              {profile.images?.length > 0 && (
                <Section title="Business Images" icon={Image} color="#f59e0b">
                  <div className="mp-images-grid">
                    {profile.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Business ${i + 1}`}
                        className="mp-biz-img"
                        onClick={() => window.open(img, "_blank")}
                      />
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}