import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ExternalLink,
  FileText,
  MapPin,
  AlertCircle,
  Star,
  Users,
  Trophy,
  ArrowRight,
  Send,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000";

const STATUS_CONFIG = {
  applied: {
    label: "Applied",
    color: "#1e40af",
    bg: "#dbeafe",
    border: "#93c5fd",
    icon: Send,
    description: "Your application is submitted and awaiting review",
  },
  under_review: {
    label: "Under Review",
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fde047",
    icon: Clock,
    description: "The recruiter is reviewing your application",
  },
  shortlisted: {
    label: "Shortlisted! 🎉",
    color: "#065f46",
    bg: "#d1fae5",
    border: "#6ee7b7",
    icon: Star,
    description: "You've been shortlisted for the hiring process",
  },
  round_update: {
    label: "In Progress",
    color: "#065f46",
    bg: "#d1fae5",
    border: "#6ee7b7",
    icon: ArrowRight,
    description: "You're progressing through the hiring rounds",
  },
  rejected: {
    label: "Not Selected",
    color: "#991b1b",
    bg: "#fee2e2",
    border: "#fecaca",
    icon: XCircle,
    description: "Thank you for applying. We hope to see you again!",
  },
  hired: {
    label: "Offer Extended! 🏆",
    color: "#065f46",
    bg: "#d1fae5",
    border: "#6ee7b7",
    icon: Trophy,
    description: "Congratulations! You've received an offer.",
  },
  withdrawn: {
    label: "Withdrawn",
    color: "#475569",
    bg: "#f1f5f9",
    border: "#e2e8f0",
    icon: XCircle,
    description: "You withdrew this application",
  },
};

const ROUND_TYPE_LABELS = {
  resume_screening: "Resume Screening",
  online_test: "Online Test",
  aptitude_test: "Aptitude Test",
  technical_interview: "Technical Interview",
  hr_interview: "HR Interview",
  group_discussion: "Group Discussion",
  assignment: "Assignment",
  final_interview: "Final Interview",
  offer: "Offer / Selection",
  other: "Other",
};

const ROUND_ICONS = {
  resume_screening: "📄",
  online_test: "💻",
  aptitude_test: "🧠",
  technical_interview: "⚙️",
  hr_interview: "🤝",
  group_discussion: "💬",
  assignment: "📝",
  final_interview: "🎯",
  offer: "🏆",
  other: "➕",
};

const RESULT_CONFIG = {
  scheduled: { label: "Scheduled", color: "#1e40af", bg: "#dbeafe" },
  pending: { label: "Pending", color: "#92400e", bg: "#fef3c7" },
  passed: { label: "Passed ✓", color: "#065f46", bg: "#d1fae5" },
  failed: { label: "Not Selected", color: "#991b1b", bg: "#fee2e2" },
};

const MyApplications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchApplications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/applications/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data.applications || []);
    } catch (err) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async (applicationId, jobTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to withdraw your application for "${jobTitle}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setWithdrawing(applicationId);
      await axios.patch(
        `${API_BASE}/api/applications/${applicationId}/withdraw`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Application withdrawn");
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw");
    } finally {
      setWithdrawing(null);
    }
  };

  const filtered =
    filterStatus === "all"
      ? applications
      : applications.filter((a) => a.status === filterStatus);

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const statusFilters = [
    { key: "all", label: "All", count: applications.length },
    { key: "applied", label: "Applied", count: counts.applied || 0 },
    { key: "under_review", label: "In Review", count: counts.under_review || 0 },
    { key: "shortlisted", label: "Shortlisted", count: counts.shortlisted || 0 },
    { key: "round_update", label: "In Rounds", count: counts.round_update || 0 },
    { key: "hired", label: "Hired", count: counts.hired || 0 },
    { key: "rejected", label: "Rejected", count: counts.rejected || 0 },
  ].filter((f) => f.key === "all" || f.count > 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .ma-root { font-family: 'Inter', sans-serif; }

        .ma-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .ma-title { font-size: 20px; font-weight: 700; color: #0f172a; }
        .ma-subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
        .ma-refresh { background: none; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; cursor: pointer; display: flex; transition: all 0.2s; }
        .ma-refresh:hover { background: #f8fafc; }

        /* Stats row */
        .ma-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .ma-stat { padding: 12px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; min-width: 80px; }
        .ma-stat-value { font-size: 22px; font-weight: 700; color: #0f172a; }
        .ma-stat-label { font-size: 11px; color: #64748b; margin-top: 2px; font-weight: 500; }

        /* Filters */
        .ma-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .ma-filter-btn {
          padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1px solid #e2e8f0; background: white; color: #64748b;
          font-family: 'Inter', sans-serif; transition: all 0.15s;
        }
        .ma-filter-btn.active { background: #0f172a; color: white; border-color: #0f172a; }
        .ma-filter-btn:hover:not(.active) { border-color: #cbd5e1; background: #f8fafc; }

        /* Application card */
        .ma-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 12px;
          margin-bottom: 16px; overflow: hidden; transition: all 0.2s;
        }
        .ma-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .ma-card.hired { border-color: #6ee7b7; }
        .ma-card.rejected { border-color: #fecaca; }
        .ma-card.shortlisted { border-color: #6ee7b7; }

        .ma-card-header { padding: 20px; cursor: pointer; }
        .ma-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .ma-job-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .ma-company { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 6px; }
        .ma-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 100px; font-size: 12px; font-weight: 700;
          border: 1px solid; flex-shrink: 0; white-space: nowrap;
        }
        .ma-card-meta { display: flex; gap: 16px; flex-wrap: wrap; }
        .ma-meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #64748b; }

        /* Skills */
        .ma-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .ma-skill-tag {
          padding: 3px 10px; background: #eff6ff; border: 1px solid #bfdbfe;
          border-radius: 100px; font-size: 11px; font-weight: 600; color: #1e40af;
        }

        /* Progress bar for rounds */
        .ma-round-progress { margin-top: 12px; }
        .ma-round-progress-bar { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; }
        .ma-round-progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 2px; transition: width 0.4s; }
        .ma-round-progress-label { font-size: 11px; color: #64748b; margin-top: 4px; }

        /* Expanded body */
        .ma-card-body { border-top: 1px solid #f1f5f9; padding: 20px; background: #fafafa; }
        .ma-body-section { margin-bottom: 20px; }
        .ma-body-section:last-child { margin-bottom: 0; }
        .ma-body-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px; }

        /* Round timeline */
        .ma-rounds { display: flex; flex-direction: column; gap: 0; }
        .ma-round-item { display: flex; gap: 12px; position: relative; }
        .ma-round-item:not(:last-child)::before {
          content: ''; position: absolute; left: 15px; top: 38px;
          width: 2px; bottom: -4px; background: #e2e8f0;
        }
        .ma-round-left { flex-shrink: 0; }
        .ma-round-circle {
          width: 32px; height: 32px; border-radius: 50%; border: 2px solid #e2e8f0;
          background: white; display: flex; align-items: center; justify-content: center;
          font-size: 13px; position: relative; z-index: 1;
        }
        .ma-round-circle.passed { border-color: #10b981; background: #d1fae5; }
        .ma-round-circle.failed { border-color: #ef4444; background: #fee2e2; }
        .ma-round-circle.scheduled { border-color: #3b82f6; background: #dbeafe; }
        .ma-round-circle.pending { border-color: #f59e0b; background: #fef3c7; }

        .ma-round-body { flex: 1; padding-bottom: 16px; padding-top: 4px; }
        .ma-round-title { font-size: 14px; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 8px; }
        .ma-round-result {
          display: inline-flex; padding: 2px 8px; border-radius: 100px;
          font-size: 11px; font-weight: 600;
        }
        .ma-round-note { font-size: 12px; color: #64748b; margin-top: 4px; line-height: 1.5; }
        .ma-round-date { font-size: 11px; color: #94a3b8; margin-top: 4px; }

        /* Cover letter */
        .ma-cover-letter {
          padding: 14px; background: white; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 13px; color: #475569; line-height: 1.7;
          white-space: pre-wrap; max-height: 160px; overflow-y: auto;
        }

        /* Applicant snapshot */
        .ma-snapshot { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .ma-snapshot-item { padding: 8px 12px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; }
        .ma-snapshot-label { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
        .ma-snapshot-value { font-size: 13px; color: #0f172a; font-weight: 500; margin-top: 2px; }

        /* Actions */
        .ma-card-actions { display: flex; gap: 8px; margin-top: 16px; }
        .ma-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1px solid; transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .ma-btn-outline { background: white; color: #475569; border-color: #e2e8f0; }
        .ma-btn-outline:hover { background: #f8fafc; }
        .ma-btn-danger { background: white; color: #dc2626; border-color: #fecaca; }
        .ma-btn-danger:hover { background: #fef2f2; }
        .ma-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Status description */
        .ma-status-desc {
          display: flex; align-items: center; gap: 8px; padding: 10px 14px;
          border-radius: 8px; font-size: 12px; font-weight: 500; margin-bottom: 16px;
          border: 1px solid;
        }

        /* Empty */
        .ma-empty { text-align: center; padding: 60px 24px; }
        .ma-empty-icon { width: 56px; height: 56px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .ma-empty-title { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
        .ma-empty-desc { font-size: 13px; color: #64748b; }

        .ma-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .ma-snapshot { grid-template-columns: 1fr; }
          .ma-card-top { flex-direction: column; }
        }
      `}</style>

      <div className="ma-root">
        {/* Header */}
        <div className="ma-header">
          <div>
            <div className="ma-title">My Applications ({applications.length})</div>
            <div className="ma-subtitle">Track the status of every job you've applied to</div>
          </div>
          <button className="ma-refresh" onClick={fetchApplications} title="Refresh">
            <RefreshCw size={16} color="#64748b" />
          </button>
        </div>

        {/* Stats */}
        {applications.length > 0 && (
          <div className="ma-stats">
            <div className="ma-stat">
              <div className="ma-stat-value">{applications.length}</div>
              <div className="ma-stat-label">Total</div>
            </div>
            {counts.shortlisted > 0 && (
              <div className="ma-stat" style={{ borderColor: "#6ee7b7" }}>
                <div className="ma-stat-value" style={{ color: "#065f46" }}>{counts.shortlisted}</div>
                <div className="ma-stat-label">Shortlisted</div>
              </div>
            )}
            {counts.hired > 0 && (
              <div className="ma-stat" style={{ borderColor: "#6ee7b7", background: "#f0fdf4" }}>
                <div className="ma-stat-value" style={{ color: "#065f46" }}>{counts.hired}</div>
                <div className="ma-stat-label">Hired 🏆</div>
              </div>
            )}
            {counts.under_review > 0 && (
              <div className="ma-stat">
                <div className="ma-stat-value" style={{ color: "#92400e" }}>{counts.under_review}</div>
                <div className="ma-stat-label">In Review</div>
              </div>
            )}
          </div>
        )}

        {/* Status filters */}
        {applications.length > 0 && (
          <div className="ma-filters">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                className={`ma-filter-btn ${filterStatus === f.key ? "active" : ""}`}
                onClick={() => setFilterStatus(f.key)}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
            <Loader2 size={28} className="ma-spinner" style={{ margin: "0 auto 12px", display: "block" }} />
            Loading applications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="ma-empty">
            <div className="ma-empty-icon">
              <Briefcase size={24} color="#cbd5e1" />
            </div>
            <div className="ma-empty-title">
              {applications.length === 0 ? "No applications yet" : "No applications match this filter"}
            </div>
            <div className="ma-empty-desc">
              {applications.length === 0
                ? "Browse open jobs and start applying today!"
                : "Try a different filter to see your applications"}
            </div>
          </div>
        ) : (
          filtered.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
            const StatusIcon = statusCfg.icon;
            const isExpanded = expandedApp === app._id;
            const job = app.job;
            const rounds = job?.rounds || [];
            const roundUpdates = app.roundUpdates || [];
            const canWithdraw = !["rejected", "hired", "withdrawn"].includes(app.status);
            const totalRounds = rounds.length;
            const passedRounds = roundUpdates.filter((r) => r.result === "passed").length;

            return (
              <div
                key={app._id}
                className={`ma-card ${app.status}`}
              >
                {/* Card header — clickable to expand */}
                <div className="ma-card-header" onClick={() => setExpandedApp(isExpanded ? null : app._id)}>
                  <div className="ma-card-top">
                    <div style={{ flex: 1 }}>
                      <div className="ma-job-title">{job?.title || "Job no longer available"}</div>
                      <div className="ma-company">
                        {job?.business?.businessProfile?.businessName || job?.company || "Company"}
                        {job?.location && (
                          <>
                            <span>·</span>
                            <MapPin size={11} />
                            {job.location}
                          </>
                        )}
                        {job?.type && <><span>·</span>{job.type}</>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        className="ma-status-badge"
                        style={{
                          color: statusCfg.color,
                          background: statusCfg.bg,
                          borderColor: statusCfg.border,
                        }}
                      >
                        <StatusIcon size={12} />
                        {statusCfg.label}
                      </div>
                      {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                    </div>
                  </div>

                  <div className="ma-card-meta">
                    <div className="ma-meta-item">
                      <Clock size={12} />
                      Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    {app.selectedSkills?.length > 0 && (
                      <div className="ma-meta-item">
                        <Star size={12} />
                        {app.selectedSkills.length} skills
                      </div>
                    )}
                    {roundUpdates.length > 0 && (
                      <div className="ma-meta-item">
                        <Users size={12} />
                        Round {app.currentRound} of {totalRounds || "?"}
                      </div>
                    )}
                  </div>

                  {/* Selected skills */}
                  {app.selectedSkills?.length > 0 && (
                    <div className="ma-skills">
                      {app.selectedSkills.slice(0, 5).map((s) => (
                        <span key={s} className="ma-skill-tag">{s}</span>
                      ))}
                      {app.selectedSkills.length > 5 && (
                        <span className="ma-skill-tag">+{app.selectedSkills.length - 5} more</span>
                      )}
                    </div>
                  )}

                  {/* Round progress bar */}
                  {totalRounds > 0 && roundUpdates.length > 0 && (
                    <div className="ma-round-progress">
                      <div className="ma-round-progress-bar">
                        <div
                          className="ma-round-progress-fill"
                          style={{ width: `${(passedRounds / totalRounds) * 100}%` }}
                        />
                      </div>
                      <div className="ma-round-progress-label">
                        {passedRounds}/{totalRounds} rounds completed
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="ma-card-body">
                    {/* Status description */}
                    <div
                      className="ma-status-desc"
                      style={{ background: statusCfg.bg, borderColor: statusCfg.border, color: statusCfg.color }}
                    >
                      <StatusIcon size={14} />
                      {statusCfg.description}
                      {app.rejectionReason && (
                        <span style={{ marginLeft: "8px", fontWeight: "400" }}>
                          — {app.rejectionReason}
                        </span>
                      )}
                    </div>

                    {/* Round updates timeline */}
                    {roundUpdates.length > 0 && (
                      <div className="ma-body-section">
                        <div className="ma-body-label">Hiring Process Updates</div>
                        <div className="ma-rounds">
                          {roundUpdates.map((ru, idx) => {
                            const resultCfg = RESULT_CONFIG[ru.result] || RESULT_CONFIG.pending;
                            return (
                              <div key={idx} className="ma-round-item">
                                <div className="ma-round-left">
                                  <div className={`ma-round-circle ${ru.result}`}>
                                    {ROUND_ICONS[ru.roundType] || "➕"}
                                  </div>
                                </div>
                                <div className="ma-round-body">
                                  <div className="ma-round-title">
                                    Round {ru.roundNumber}: {ru.roundTitle || ROUND_TYPE_LABELS[ru.roundType] || ru.roundType}
                                    <span
                                      className="ma-round-result"
                                      style={{ background: resultCfg.bg, color: resultCfg.color }}
                                    >
                                      {resultCfg.label}
                                    </span>
                                  </div>
                                  {ru.note && <div className="ma-round-note">💬 {ru.note}</div>}
                                  <div className="ma-round-date">
                                    {new Date(ru.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Cover letter */}
                    <div className="ma-body-section">
                      <div className="ma-body-label">Your Cover Letter</div>
                      <div className="ma-cover-letter">{app.coverLetter}</div>
                    </div>

                    {/* Applicant snapshot */}
                    {app.applicantSnapshot && (
                      <div className="ma-body-section">
                        <div className="ma-body-label">Profile Submitted</div>
                        <div className="ma-snapshot">
                          {[
                            ["Name", app.applicantSnapshot.fullName],
                            ["Email", app.applicantSnapshot.email],
                            ["Mobile", app.applicantSnapshot.mobile],
                            ["City", app.applicantSnapshot.city],
                            ["Education", app.applicantSnapshot.education],
                            ["Experience", app.applicantSnapshot.experience],
                          ]
                            .filter(([, v]) => v)
                            .map(([label, value]) => (
                              <div key={label} className="ma-snapshot-item">
                                <div className="ma-snapshot-label">{label}</div>
                                <div className="ma-snapshot-value">{value}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="ma-card-actions">
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ma-btn ma-btn-outline"
                          style={{ textDecoration: "none" }}
                        >
                          <FileText size={13} />
                          View Resume
                        </a>
                      )}
                      {job?._id && job?.status === "approved" && (
                        <a
                          href={`/jobs/${job._id}`}
                          className="ma-btn ma-btn-outline"
                          style={{ textDecoration: "none" }}
                        >
                          <ExternalLink size={13} />
                          View Job
                        </a>
                      )}
                      {canWithdraw && (
                        <button
                          className="ma-btn ma-btn-danger"
                          onClick={() => handleWithdraw(app._id, job?.title)}
                          disabled={withdrawing === app._id}
                          style={{ marginLeft: "auto" }}
                        >
                          {withdrawing === app._id ? (
                            <Loader2 size={13} className="ma-spinner" />
                          ) : (
                            <XCircle size={13} />
                          )}
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default MyApplications;