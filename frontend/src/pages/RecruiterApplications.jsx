import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Send,
  Linkedin,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000";

const STATUS_COLORS = {
  applied:      { label: "New",         color: "#1e40af", bg: "#dbeafe", border: "#93c5fd" },
  under_review: { label: "Reviewing",   color: "#92400e", bg: "#fef3c7", border: "#fde047" },
  shortlisted:  { label: "Shortlisted", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  round_update: { label: "In Progress", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  rejected:     { label: "Rejected",    color: "#991b1b", bg: "#fee2e2", border: "#fecaca" },
  hired:        { label: "Hired ✓",     color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  withdrawn:    { label: "Withdrawn",   color: "#475569", bg: "#f1f5f9", border: "#e2e8f0" },
};

const ROUND_ICONS = {
  resume_screening: "📄", online_test: "💻", aptitude_test: "🧠",
  technical_interview: "⚙️", hr_interview: "🤝", group_discussion: "💬",
  assignment: "📝", final_interview: "🎯", offer: "🏆", other: "➕",
};

const ROUND_TYPE_LABELS = {
  resume_screening: "Resume Screening", online_test: "Online Test",
  aptitude_test: "Aptitude Test", technical_interview: "Technical Interview",
  hr_interview: "HR Interview", group_discussion: "Group Discussion",
  assignment: "Assignment", final_interview: "Final Interview",
  offer: "Offer / Selection", other: "Other",
};

/* ─────────────────────────────────────────────
   ApplicationCard — own component so hooks are
   always called at the top level (not in a loop)
───────────────────────────────────────────── */
const ApplicationCard = ({
  app,
  expandedApp,
  setExpandedApp,
  actionLoading,
  handleShortlist,
  setRoundModal,
  setRoundResult,
  setRoundNote,
  setAdvanceToNext,
  setRejectModal,
  setRejectReason,
  updateNotes,
}) => {
  // ✅ Hooks are now safe — called at the top level of a real component
  const [localNotes, setLocalNotes] = useState(app.internalNotes || "");
  const [localRating, setLocalRating] = useState(app.recruiterRating || 0);

  const snap = app.applicantSnapshot || {};
  const statusCfg = STATUS_COLORS[app.status] || STATUS_COLORS.applied;
  const isExpanded = expandedApp === app._id;
  const job = app.job;
  const rounds = job?.rounds || [];
  const roundUpdates = app.roundUpdates || [];
  const canShortlist = ["applied", "under_review"].includes(app.status);
  const canUpdateRound = ["shortlisted", "round_update"].includes(app.status) && rounds.length > 0;
  const canReject = !["rejected", "hired", "withdrawn"].includes(app.status);
  const currentRoundData = rounds[app.currentRound - 1];

  return (
    <div className={`ra-card ${app.status}`}>
      {/* Card Header */}
      <div className="ra-card-header" onClick={() => setExpandedApp(isExpanded ? null : app._id)}>
        <div className="ra-card-top">
          <div style={{ flex: 1 }}>
            <div className="ra-applicant-name">{snap.fullName || app.jobseeker?.name || "Applicant"}</div>
            <div className="ra-applicant-meta">
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Mail size={12} />{snap.email || app.jobseeker?.email}
              </span>
              {snap.mobile && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Phone size={12} />{snap.mobile}
                </span>
              )}
              {snap.city && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={12} />{snap.city}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              className="ra-status-badge"
              style={{ color: statusCfg.color, background: statusCfg.bg, borderColor: statusCfg.border }}
            >
              {statusCfg.label}
            </div>
            {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
          </div>
        </div>

        <div className="ra-card-sub">
          <div className="ra-card-sub-item"><Briefcase size={12} />{job?.title || "—"}</div>
          <div className="ra-card-sub-item">
            <Clock size={12} />
            {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
          {snap.experience && (
            <div className="ra-card-sub-item"><Briefcase size={12} />{snap.experience} yrs exp</div>
          )}
          {snap.education && (
            <div className="ra-card-sub-item"><GraduationCap size={12} />{snap.education}</div>
          )}
          {/* Star rating */}
          <div className="ra-stars" onClick={(e) => e.stopPropagation()}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className="ra-star"
                fill={s <= localRating ? "#f59e0b" : "none"}
                color={s <= localRating ? "#f59e0b" : "#cbd5e1"}
                onClick={() => {
                  setLocalRating(s);
                  updateNotes(app._id, localNotes, s);
                }}
              />
            ))}
          </div>
        </div>

        {/* Selected skills */}
        {app.selectedSkills?.length > 0 && (
          <div className="ra-skills">
            {app.selectedSkills.map((s) => (
              <span key={s} className="ra-skill">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Body */}
      {isExpanded && (
        <div className="ra-body">
          <div className="ra-body-grid">
            {/* Left — Applicant details */}
            <div>
              <div className="ra-section-label">Applicant Profile</div>
              {[
                [GraduationCap, "Education",   snap.education,                              false],
                [Briefcase,     "Experience",  snap.experience ? `${snap.experience} year(s)` : null, false],
                [MapPin,        "City",        snap.city,                                   false],
                [Phone,         "Mobile",      snap.mobile,                                 false],
                [Linkedin,      "LinkedIn",    snap.linkedin,                               true],
                [ExternalLink,  "Portfolio",   snap.portfolio,                              true],
              ]
                .filter(([, , v]) => v)
                .map(([Icon, label, value, isLink]) => (
                  <div key={label} className="ra-detail-item">
                    <div className="ra-detail-label">{label}</div>
                    <div className="ra-detail-value">
                      {isLink ? (
                        <a href={value} target="_blank" rel="noreferrer">
                          {value.length > 35 ? value.slice(0, 35) + "…" : value}
                        </a>
                      ) : (
                        value
                      )}
                    </div>
                  </div>
                ))}

              {app.resumeUrl && (
                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", background: "#0f172a", color: "white",
                    borderRadius: "7px", fontSize: "12px", fontWeight: "600",
                    textDecoration: "none", marginTop: "8px",
                  }}
                >
                  <FileText size={13} /> View Resume
                </a>
              )}
            </div>

            {/* Right — Rounds + Notes */}
            <div>
              {roundUpdates.length > 0 ? (
                <>
                  <div className="ra-section-label">Round Progress</div>
                  <div className="ra-rounds">
                    {roundUpdates.map((ru, idx) => {
                      const resultColors = {
                        passed:    { bg: "#d1fae5", color: "#065f46" },
                        failed:    { bg: "#fee2e2", color: "#991b1b" },
                        scheduled: { bg: "#dbeafe", color: "#1e40af" },
                        pending:   { bg: "#fef3c7", color: "#92400e" },
                      };
                      const rc = resultColors[ru.result] || resultColors.pending;
                      return (
                        <div key={idx} className="ra-round">
                          <div className={`ra-round-icon ${ru.result}`}>
                            {ROUND_ICONS[ru.roundType] || "➕"}
                          </div>
                          <div className="ra-round-body">
                            <div className="ra-round-title">
                              Round {ru.roundNumber}: {ru.roundTitle}
                              <span className="ra-round-result" style={{ background: rc.bg, color: rc.color }}>
                                {ru.result}
                              </span>
                            </div>
                            {ru.note && <div className="ra-round-note">"{ru.note}"</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{
                  padding: "16px", background: "white", border: "1px solid #e2e8f0",
                  borderRadius: "8px", fontSize: "13px", color: "#64748b", textAlign: "center",
                }}>
                  No round updates yet
                </div>
              )}

              {/* Internal Notes */}
              <div style={{ marginTop: "16px" }}>
                <div className="ra-section-label">Internal Notes (not shown to applicant)</div>
                <textarea
                  className="ra-notes"
                  placeholder="Add private notes about this candidate..."
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  onBlur={() => updateNotes(app._id, localNotes, localRating)}
                />
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="ra-section-label">Cover Letter</div>
          <div className="ra-cover">{app.coverLetter}</div>

          {/* Action Buttons */}
          <div className="ra-actions">
            {canShortlist && (
              <button
                className="ra-btn ra-btn-green"
                onClick={() => handleShortlist(app._id, snap.fullName || app.jobseeker?.name)}
                disabled={!!actionLoading}
              >
                {actionLoading === app._id + "_shortlist"
                  ? <Loader2 size={13} className="ra-spinner" />
                  : <CheckCircle size={14} />}
                Shortlist
              </button>
            )}

            {canUpdateRound && (
              <button
                className="ra-btn ra-btn-primary"
                onClick={() => {
                  setRoundModal({
                    applicationId: app._id,
                    roundNumber: app.currentRound,
                    roundTitle:
                      currentRoundData?.title ||
                      ROUND_TYPE_LABELS[currentRoundData?.type] ||
                      `Round ${app.currentRound}`,
                    totalRounds: rounds.length,
                  });
                  setRoundResult("passed");
                  setRoundNote("");
                  setAdvanceToNext(true);
                }}
                disabled={!!actionLoading}
              >
                <ArrowRight size={14} />
                Update Round {app.currentRound}
              </button>
            )}

            {canReject && (
              <button
                className="ra-btn ra-btn-danger"
                onClick={() => {
                  setRejectModal({ applicationId: app._id, name: snap.fullName || app.jobseeker?.name });
                  setRejectReason("");
                }}
                disabled={!!actionLoading}
                style={{ marginLeft: "auto" }}
              >
                <XCircle size={14} />
                Reject
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main RecruiterApplications component
───────────────────────────────────────────── */
const RecruiterApplications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [expandedApp, setExpandedApp]   = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJob, setFilterJob]       = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  // Round modal
  const [roundModal, setRoundModal]     = useState(null);
  const [roundResult, setRoundResult]   = useState("passed");
  const [roundNote, setRoundNote]       = useState("");
  const [advanceToNext, setAdvanceToNext] = useState(true);

  // Reject modal
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchApplications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/applications/recruiter`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data.applications || []);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleShortlist = async (applicationId, applicantName) => {
    const note = prompt(`Add a note for ${applicantName} (optional):`);
    try {
      setActionLoading(applicationId + "_shortlist");
      await axios.patch(
        `${API_BASE}/api/applications/${applicationId}/shortlist`,
        { note: note || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${applicantName} shortlisted! Email sent.`);
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to shortlist");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoundUpdate = async () => {
    if (!roundModal) return;
    try {
      setActionLoading(roundModal.applicationId + "_round");
      await axios.patch(
        `${API_BASE}/api/applications/${roundModal.applicationId}/round-result`,
        {
          roundNumber: roundModal.roundNumber,
          result: roundResult,
          note: roundNote,
          advanceToNext: advanceToNext && roundResult === "passed",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Round result updated. Email sent to applicant.");
      setRoundModal(null);
      setRoundNote("");
      setRoundResult("passed");
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update round");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      setActionLoading(rejectModal.applicationId + "_reject");
      await axios.patch(
        `${API_BASE}/api/applications/${rejectModal.applicationId}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Applicant rejected. Email sent.");
      setRejectModal(null);
      setRejectReason("");
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  const updateNotes = async (applicationId, notes, rating) => {
    try {
      await axios.patch(
        `${API_BASE}/api/applications/${applicationId}/notes`,
        { internalNotes: notes, recruiterRating: rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    }
  };

  const uniqueJobs = [...new Map(
    applications.filter((a) => a.job).map((a) => [a.job._id, a.job])
  ).values()];

  const filtered = applications.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterJob !== "all" && a.job?._id !== filterJob) return false;
    return true;
  });

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .ra-root { font-family: 'Inter', sans-serif; }

        .ra-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .ra-title { font-size:20px; font-weight:700; color:#0f172a; }
        .ra-subtitle { font-size:13px; color:#64748b; margin-top:2px; }

        .ra-stats { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
        .ra-stat { padding:10px 16px; background:white; border:1px solid #e2e8f0; border-radius:8px; text-align:center; min-width:70px; }
        .ra-stat-value { font-size:20px; font-weight:700; color:#0f172a; }
        .ra-stat-label { font-size:11px; color:#64748b; margin-top:2px; }

        .ra-filters { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
        .ra-filter {
          padding:6px 14px; border-radius:100px; font-size:12px; font-weight:600;
          cursor:pointer; border:1px solid #e2e8f0; background:white; color:#64748b;
          font-family:'Inter',sans-serif; transition:all 0.15s;
        }
        .ra-filter.active { background:#0f172a; color:white; border-color:#0f172a; }
        .ra-filter:hover:not(.active) { background:#f8fafc; }

        .ra-job-filter {
          padding:6px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px;
          background:white; color:#475569; font-family:'Inter',sans-serif;
          margin-bottom:20px; cursor:pointer; outline:none;
        }
        .ra-job-filter:focus { border-color:#0f172a; }

        .ra-card { background:white; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:16px; overflow:hidden; transition:all 0.2s; }
        .ra-card:hover { box-shadow:0 2px 8px rgba(0,0,0,0.06); }
        .ra-card.applied      { border-left:3px solid #3b82f6; }
        .ra-card.under_review { border-left:3px solid #f59e0b; }
        .ra-card.shortlisted  { border-left:3px solid #10b981; }
        .ra-card.hired        { border-left:3px solid #10b981; background:#fafffe; }
        .ra-card.rejected     { border-left:3px solid #ef4444; }

        .ra-card-header { padding:18px 20px; cursor:pointer; }
        .ra-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .ra-applicant-name { font-size:16px; font-weight:700; color:#0f172a; margin-bottom:3px; }
        .ra-applicant-meta { font-size:13px; color:#64748b; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .ra-status-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:100px; font-size:11px; font-weight:700; border:1px solid; }
        .ra-card-sub { font-size:12px; color:#64748b; margin-top:8px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .ra-card-sub-item { display:flex; align-items:center; gap:4px; }

        .ra-skills { display:flex; flex-wrap:wrap; gap:5px; margin-top:10px; }
        .ra-skill { padding:2px 8px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:100px; font-size:11px; font-weight:600; color:#1e40af; }

        .ra-stars { display:flex; gap:2px; }
        .ra-star { cursor:pointer; transition:color 0.1s; }

        .ra-body { border-top:1px solid #f1f5f9; padding:20px; background:#fafafa; }
        .ra-body-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
        .ra-section-label { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:10px; }

        .ra-detail-item { padding:8px 12px; background:white; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:6px; }
        .ra-detail-label { font-size:10px; color:#94a3b8; font-weight:600; text-transform:uppercase; }
        .ra-detail-value { font-size:13px; color:#0f172a; font-weight:500; margin-top:2px; word-break:break-word; }
        .ra-detail-value a { color:#3b82f6; text-decoration:none; }
        .ra-detail-value a:hover { text-decoration:underline; }

        .ra-cover { padding:14px; background:white; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; color:#475569; line-height:1.7; white-space:pre-wrap; max-height:160px; overflow-y:auto; margin-bottom:16px; }

        .ra-rounds { display:flex; flex-direction:column; gap:0; margin-bottom:16px; }
        .ra-round { display:flex; gap:12px; position:relative; }
        .ra-round:not(:last-child)::before { content:''; position:absolute; left:15px; top:36px; width:2px; bottom:-4px; background:#e2e8f0; }
        .ra-round-icon { width:32px; height:32px; border-radius:50%; background:white; border:2px solid #e2e8f0; display:flex; align-items:center; justify-content:center; font-size:14px; position:relative; z-index:1; flex-shrink:0; }
        .ra-round-icon.passed    { border-color:#10b981; }
        .ra-round-icon.failed    { border-color:#ef4444; }
        .ra-round-icon.scheduled { border-color:#3b82f6; }
        .ra-round-body { flex:1; padding-bottom:14px; padding-top:4px; }
        .ra-round-title { font-size:14px; font-weight:600; color:#0f172a; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .ra-round-result { padding:2px 8px; border-radius:100px; font-size:11px; font-weight:600; }
        .ra-round-note { font-size:12px; color:#64748b; margin-top:4px; }

        .ra-actions { display:flex; gap:8px; flex-wrap:wrap; padding-top:16px; border-top:1px solid #e2e8f0; }
        .ra-btn {
          display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
          border-radius:7px; font-size:13px; font-weight:600; cursor:pointer;
          border:1px solid; transition:all 0.2s; font-family:'Inter',sans-serif;
        }
        .ra-btn-primary { background:#0f172a; color:white; border-color:#0f172a; }
        .ra-btn-primary:hover:not(:disabled) { background:#1e293b; }
        .ra-btn-green { background:#10b981; color:white; border-color:#10b981; }
        .ra-btn-green:hover:not(:disabled) { background:#059669; }
        .ra-btn-outline { background:white; color:#475569; border-color:#e2e8f0; }
        .ra-btn-outline:hover:not(:disabled) { background:#f8fafc; }
        .ra-btn-danger { background:white; color:#dc2626; border-color:#fecaca; }
        .ra-btn-danger:hover:not(:disabled) { background:#fef2f2; }
        .ra-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .ra-notes {
          width:100%; padding:10px; font-size:13px; font-family:'Inter',sans-serif;
          border:1px solid #e2e8f0; border-radius:8px; background:white; color:#0f172a;
          outline:none; resize:vertical; min-height:72px; transition:all 0.2s; box-sizing:border-box;
        }
        .ra-notes:focus { border-color:#0f172a; }

        .ra-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:16px; }
        .ra-modal { background:white; border-radius:14px; padding:28px; width:100%; max-width:480px; box-shadow:0 24px 80px rgba(0,0,0,0.2); }
        .ra-modal-title { font-size:18px; font-weight:700; color:#0f172a; margin-bottom:6px; }
        .ra-modal-sub { font-size:13px; color:#64748b; margin-bottom:20px; }
        .ra-modal-label { font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; display:block; }
        .ra-modal-select { width:100%; padding:10px 12px; font-size:14px; border:1.5px solid #e2e8f0; border-radius:8px; font-family:'Inter',sans-serif; background:white; color:#0f172a; outline:none; margin-bottom:14px; }
        .ra-modal-select:focus { border-color:#0f172a; }
        .ra-modal-input { width:100%; padding:10px 12px; font-size:13px; font-family:'Inter',sans-serif; border:1.5px solid #e2e8f0; border-radius:8px; background:white; color:#0f172a; outline:none; resize:vertical; min-height:80px; transition:all 0.2s; box-sizing:border-box; margin-bottom:14px; }
        .ra-modal-input:focus { border-color:#0f172a; }
        .ra-modal-checkbox { display:flex; align-items:center; gap:8px; font-size:13px; color:#475569; margin-bottom:20px; cursor:pointer; }
        .ra-modal-checkbox input { cursor:pointer; width:16px; height:16px; }
        .ra-modal-actions { display:flex; gap:10px; justify-content:flex-end; }
        .ra-cancel { padding:9px 18px; background:#f1f5f9; color:#475569; border:none; border-radius:7px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; }

        .ra-empty { text-align:center; padding:60px 24px; }
        .ra-empty-icon { width:56px; height:56px; background:#f1f5f9; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }

        .ra-spinner { animation:spin 1s linear infinite; }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

        @media (max-width:600px) {
          .ra-body-grid { grid-template-columns:1fr; }
          .ra-card-top  { flex-direction:column; }
          .ra-actions   { flex-direction:column; }
        }
      `}</style>

      <div className="ra-root">
        {/* Header */}
        <div className="ra-header">
          <div>
            <div className="ra-title">Applications ({applications.length})</div>
            <div className="ra-subtitle">Review and manage all job applications</div>
          </div>
          <button
            onClick={fetchApplications}
            style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "6px", cursor: "pointer" }}
          >
            <RefreshCw size={16} color="#64748b" />
          </button>
        </div>

        {/* Stats */}
        {applications.length > 0 && (
          <div className="ra-stats">
            {[
              ["Total",      applications.length,     "#0f172a"],
              ["New",        counts.applied || 0,     "#1e40af"],
              ["Reviewing",  counts.under_review || 0,"#92400e"],
              ["Shortlisted",counts.shortlisted || 0, "#065f46"],
              ["Hired",      counts.hired || 0,       "#065f46"],
              ["Rejected",   counts.rejected || 0,    "#991b1b"],
            ].map(([label, val, color]) => (
              <div key={label} className="ra-stat">
                <div className="ra-stat-value" style={{ color }}>{val}</div>
                <div className="ra-stat-label">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Status filter pills */}
        <div className="ra-filters">
          {[
            { key: "all",          label: "All" },
            { key: "applied",      label: "New" },
            { key: "under_review", label: "Reviewing" },
            { key: "shortlisted",  label: "Shortlisted" },
            { key: "round_update", label: "In Rounds" },
            { key: "hired",        label: "Hired" },
            { key: "rejected",     label: "Rejected" },
          ].map((f) => (
            <button
              key={f.key}
              className={`ra-filter ${filterStatus === f.key ? "active" : ""}`}
              onClick={() => setFilterStatus(f.key)}
            >
              {f.label}{f.key !== "all" && counts[f.key] ? ` (${counts[f.key]})` : ""}
            </button>
          ))}
        </div>

        {/* Job filter */}
        {uniqueJobs.length > 1 && (
          <select className="ra-job-filter" value={filterJob} onChange={(e) => setFilterJob(e.target.value)}>
            <option value="all">All Jobs</option>
            {uniqueJobs.map((j) => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
        )}

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
            <Loader2 size={28} className="ra-spinner" style={{ margin: "0 auto 12px", display: "block" }} />
            Loading applications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="ra-empty">
            <div className="ra-empty-icon"><Users size={24} color="#cbd5e1" /></div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>No applications found</div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>Applications will appear here once jobseekers apply</div>
          </div>
        ) : (
          // ✅ Each card is its own component — hooks are safe
          filtered.map((app) => (
            <ApplicationCard
              key={app._id}
              app={app}
              expandedApp={expandedApp}
              setExpandedApp={setExpandedApp}
              actionLoading={actionLoading}
              handleShortlist={handleShortlist}
              setRoundModal={setRoundModal}
              setRoundResult={setRoundResult}
              setRoundNote={setRoundNote}
              setAdvanceToNext={setAdvanceToNext}
              setRejectModal={setRejectModal}
              setRejectReason={setRejectReason}
              updateNotes={updateNotes}
            />
          ))
        )}

        {/* Round Update Modal */}
        {roundModal && (
          <div className="ra-overlay" onClick={(e) => e.target === e.currentTarget && setRoundModal(null)}>
            <div className="ra-modal">
              <div className="ra-modal-title">Update Round Result</div>
              <div className="ra-modal-sub">Round {roundModal.roundNumber}: {roundModal.roundTitle}</div>

              <label className="ra-modal-label">Result</label>
              <select className="ra-modal-select" value={roundResult} onChange={(e) => setRoundResult(e.target.value)}>
                <option value="passed">✅ Passed — Move forward</option>
                <option value="failed">❌ Failed — Reject candidate</option>
                <option value="scheduled">📅 Scheduled — Awaiting</option>
                <option value="pending">⏳ Pending — Under evaluation</option>
              </select>

              {roundResult === "passed" && roundModal.roundNumber < roundModal.totalRounds && (
                <label className="ra-modal-checkbox">
                  <input type="checkbox" checked={advanceToNext} onChange={(e) => setAdvanceToNext(e.target.checked)} />
                  Advance candidate to Round {roundModal.roundNumber + 1} and notify them
                </label>
              )}

              {roundResult === "passed" && roundModal.roundNumber >= roundModal.totalRounds && (
                <div style={{ padding: "10px 14px", background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "8px", fontSize: "13px", color: "#065f46", marginBottom: "14px" }}>
                  🏆 This is the final round — selecting "Passed" will send a hire offer to the candidate!
                </div>
              )}

              <label className="ra-modal-label">Message to candidate (optional)</label>
              <textarea
                className="ra-modal-input"
                placeholder="Add feedback or instructions for the candidate..."
                value={roundNote}
                onChange={(e) => setRoundNote(e.target.value)}
              />

              <div className="ra-modal-actions">
                <button className="ra-cancel" onClick={() => setRoundModal(null)}>Cancel</button>
                <button
                  className="ra-btn ra-btn-primary"
                  onClick={handleRoundUpdate}
                  disabled={!!actionLoading}
                >
                  {actionLoading === roundModal.applicationId + "_round"
                    ? <Loader2 size={13} className="ra-spinner" />
                    : <Send size={13} />}
                  Update & Notify
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal && (
          <div className="ra-overlay" onClick={(e) => e.target === e.currentTarget && setRejectModal(null)}>
            <div className="ra-modal">
              <div className="ra-modal-title">Reject Applicant</div>
              <div className="ra-modal-sub">
                You're rejecting <strong>{rejectModal.name}</strong>. They will receive an email notification.
              </div>

              <label className="ra-modal-label">Reason (optional — shown to candidate)</label>
              <textarea
                className="ra-modal-input"
                placeholder="e.g. We are looking for more experience in X, or we've found a better fit..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />

              <div className="ra-modal-actions">
                <button className="ra-cancel" onClick={() => setRejectModal(null)}>Cancel</button>
                <button
                  className="ra-btn ra-btn-danger"
                  style={{ background: "#dc2626", color: "white", borderColor: "#dc2626" }}
                  onClick={handleReject}
                  disabled={!!actionLoading}
                >
                  {actionLoading === rejectModal.applicationId + "_reject"
                    ? <Loader2 size={13} className="ra-spinner" />
                    : <XCircle size={13} />}
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RecruiterApplications;