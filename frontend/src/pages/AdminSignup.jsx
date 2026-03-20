import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import EmailSignup from "../components/Auth/EmailSignup";
import SignupVerifyOtp from "../components/Auth/SignupVerifyOtp";
import Navbar from "../components/common/Navbar";

const AdminSignup = () => {
  const [step, setStep] = useState("signup");
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.profileCompleted ? "/admin/dashboard" : "/complete-profile"} replace />;
  }

  const handleOTPSent = (userEmail) => { setEmail(userEmail); setStep("verify"); };
  const handleBack = () => { setStep("signup"); setEmail(""); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .adms-page {
          min-height: calc(100vh - 82px);
          background: #09090b;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 40px 20px; position: relative;
        }

        .adms-scanlines { position: fixed; inset: 0; pointer-events: none; z-index: 0; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px); }

        .adms-container { position: relative; z-index: 2; width: 100%; max-width: 460px; }

        .adms-statusbar {
          background: #18181b; border: 1px solid #27272a; border-radius: 8px 8px 0 0;
          padding: 10px 18px; display: flex; align-items: center; justify-content: space-between;
          font-family: 'Inter', sans-serif; font-size: 11px; color: #3f3f46; font-weight: 500;
        }
        .adms-status-left { display: flex; align-items: center; gap: 8px; }
        .adms-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; animation: admsBlink 2s ease-in-out infinite; }
        @keyframes admsBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .adms-status-text { color: #f59e0b; font-weight: 700; letter-spacing: 0.05em; }

        .adms-card {
          background: #09090b; border: 1px solid #27272a; border-top: none;
          border-radius: 0 0 12px 12px; padding: 36px 40px 32px;
          animation: admsIn 0.4s ease both;
        }
        @keyframes admsIn { from { opacity: 0; } to { opacity: 1; } }

        .adms-shield-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .adms-shield-icon { width: 44px; height: 44px; border: 1px solid #27272a; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: #18181b; }
        .adms-shield-title { font-size: 16px; font-weight: 800; color: #fafafa; letter-spacing: -0.2px; }
        .adms-shield-sub { font-size: 12px; color: #52525b; margin-top: 2px; font-weight: 400; }

        .adms-role-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
        .adms-chip {
          padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700;
          border: 1px solid #27272a; background: transparent; color: #52525b;
          text-decoration: none; transition: all 0.15s; letter-spacing: 0.05em; text-transform: uppercase;
        }
        .adms-chip:hover { border-color: #52525b; color: #a1a1aa; }
        .adms-chip.active { border-color: #fafafa; color: #fafafa; }

        .adms-heading { font-size: 24px; font-weight: 800; color: #fafafa; margin-bottom: 4px; letter-spacing: -0.4px; }
        .adms-heading span { color: #f59e0b; }
        .adms-sub { font-size: 12px; color: #52525b; margin-bottom: 24px; font-weight: 400; }

        /* Warning gate */
        .adms-gate {
          background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.2);
          border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;
        }
        .adms-gate-title {
          font-size: 12px; font-weight: 700; color: #f59e0b; margin-bottom: 8px;
          display: flex; align-items: center; gap: 7px; letter-spacing: 0.02em;
        }
        .adms-gate-desc { font-size: 12px; color: #52525b; line-height: 1.6; margin-bottom: 14px; font-weight: 400; }
        .adms-gate-check { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
        .adms-gate-checkbox {
          width: 16px; height: 16px; border: 1px solid #3f3f46; border-radius: 3px;
          background: #18181b; flex-shrink: 0; margin-top: 1px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; cursor: pointer;
        }
        .adms-gate-checkbox.checked { border-color: #f59e0b; background: rgba(245,158,11,0.15); }
        .adms-gate-check-text { font-size: 11px; color: #71717a; line-height: 1.5; font-weight: 500; }

        /* ══ OTP grid fix ══ */
        .adms-card .otp-row,
        .adms-card [class*="otp-row"],
        .adms-card [class*="otp_row"] {
          display: grid !important;
          grid-template-columns: repeat(6, 1fr) !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .adms-card .otp-row input,
        .adms-card [class*="otp-row"] input,
        .adms-card [class*="otp_row"] input {
          width: 100% !important;
          flex: unset !important;
          aspect-ratio: 1/1 !important;
          max-height: 56px !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }

        /* Child form overrides */
        .adms-card input {
          background: #18181b !important;
          border: 1px solid #27272a !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          color: #fafafa !important;
          box-sizing: border-box !important;
        }
        .adms-card input::placeholder { color: #3f3f46 !important; }
        .adms-card input:focus { border-color: #f59e0b !important; box-shadow: 0 0 0 2px rgba(245,158,11,0.12) !important; }
        .adms-card label {
          font-family: 'Inter', sans-serif !important;
          font-size: 11px !important; font-weight: 700 !important;
          color: #52525b !important; letter-spacing: 0.08em !important; text-transform: uppercase !important;
        }
        .adms-card button[type="submit"] {
          background: #fafafa !important; color: #09090b !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important; font-weight: 700 !important;
        }
        .adms-card button[type="submit"]:hover:not(:disabled) { background: #e4e4e7 !important; }
        .adms-card input[maxLength="1"],
        .adms-card input[maxlength="1"] {
          font-size: 22px !important; font-weight: 800 !important;
          text-align: center !important; color: #f59e0b !important;
        }
        .adms-card input[maxLength="1"]:focus,
        .adms-card input[maxlength="1"]:focus {
          background: #1c1a14 !important; border-color: #f59e0b !important;
        }

        .adms-back { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; color: #52525b; margin-bottom: 20px; padding: 0; font-family: 'Inter', sans-serif; font-weight: 500; transition: color 0.15s; }
        .adms-back:hover { color: #a1a1aa; }

        .adms-footer { text-align: center; margin-top: 20px; font-size: 13px; color: #3f3f46; }
        .adms-footer a { color: #71717a; text-decoration: none; font-weight: 500; }
        .adms-footer a:hover { color: #a1a1aa; }

        .adms-disabled { opacity: 0.4; pointer-events: none; }

        @media (max-width: 480px) { .adms-card { padding: 28px 24px 24px; } }
      `}</style>

      <Navbar />
      <div className="adms-page">
        <div className="adms-scanlines" />
        <div className="adms-container">
          <div className="adms-statusbar">
            <div className="adms-status-left">
              <div className="adms-status-dot" />
              <span className="adms-status-text">RESTRICTED REGISTRATION</span>
            </div>
            <span>greenjobs.admin</span>
          </div>
          <div className="adms-card">
            <div className="adms-shield-row">
              <div className="adms-shield-icon"><ShieldCheck size={22} color="#f59e0b" /></div>
              <div>
                <div className="adms-shield-title">Admin Registration</div>
                <div className="adms-shield-sub">By invitation only</div>
              </div>
            </div>
            <div className="adms-role-row">
              <Link to="/signup" className="adms-chip">Seeker</Link>
              <Link to="/recruiter/signup" className="adms-chip">Recruiter</Link>
              <Link to="/business/signup" className="adms-chip">Business</Link>
              <span className="adms-chip active">Admin</span>
            </div>
            {step === "signup" ? (
              <>
                <h1 className="adms-heading"><span>Register</span></h1>
                <p className="adms-sub">Admin access requires authorisation</p>
                <div className="adms-gate">
                  <div className="adms-gate-title">
                    <AlertTriangle size={13} color="#f59e0b" />
                    Restricted Access Zone
                  </div>
                  <div className="adms-gate-desc">
                    Admin accounts have full platform access. Registration requires a valid invitation code and will be reviewed before activation.
                  </div>
                  <label className="adms-gate-check" onClick={() => setConfirmed(c => !c)}>
                    <div className={`adms-gate-checkbox ${confirmed ? "checked" : ""}`}>
                      {confirmed && <span style={{ color: "#f59e0b", fontSize: 10, fontWeight: 800 }}>✓</span>}
                    </div>
                    <span className="adms-gate-check-text">I confirm I am an authorised administrator with a valid invitation</span>
                  </label>
                </div>
                <div className={confirmed ? "" : "adms-disabled"}>
                  <EmailSignup onOTPSent={handleOTPSent} role="admin" />
                </div>
              </>
            ) : (
              <>
                <button className="adms-back" type="button" onClick={handleBack}><ArrowLeft size={12} /> Back to email</button>
                <h1 className="adms-heading"><span>Verify OTP</span></h1>
                <p className="adms-sub">Code dispatched to {email}</p>
                <SignupVerifyOtp email={email} onBack={handleBack} />
              </>
            )}
            <div className="adms-footer">
              <Link to="/admin/login">← Admin login</Link>
              {" · "}
              <Link to="/">Home</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSignup;