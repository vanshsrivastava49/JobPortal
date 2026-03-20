import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";
import GoogleSignIn from "../components/Auth/GoogleSignIn";
import EmailSignup from "../components/Auth/EmailSignup";
import SignupVerifyOtp from "../components/Auth/SignupVerifyOtp";
import Navbar from "../components/common/Navbar";

const RecruiterSignup = () => {
  const [step, setStep] = useState("signup");
  const [email, setEmail] = useState("");
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.profileCompleted ? "/recruiter/dashboard" : "/complete-profile"} replace />;
  }

  const handleOTPSent = (userEmail) => { setEmail(userEmail); setStep("verify"); };
  const handleBack = () => { setStep("signup"); setEmail(""); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .recs-page {
          min-height: calc(100vh - 82px);
          background: #0f172a;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 40px 20px;
          position: relative; overflow: hidden;
        }

        .recs-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .recs-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%); top: -100px; right: -100px; pointer-events: none; }
        .recs-glow2 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%); bottom: -80px; left: -80px; pointer-events: none; }

        .recs-card {
          position: relative; z-index: 2;
          width: 100%; max-width: 480px;
          background: rgba(15,23,42,0.85);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 20px;
          padding: 44px 44px 36px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 60px rgba(59,130,246,0.08), 0 24px 48px rgba(0,0,0,0.4);
          animation: recsSlide 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes recsSlide { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

        .recs-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25);
          border-radius: 20px; padding: 5px 14px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: #60a5fa; margin-bottom: 22px;
        }
        .recs-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; animation: recsPulse 1.5s ease-in-out infinite; }
        @keyframes recsPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }

        .recs-heading { font-size: 28px; font-weight: 800; color: white; margin-bottom: 6px; letter-spacing: -0.5px; }
        .recs-sub { font-size: 13px; color: #64748b; margin-bottom: 28px; font-weight: 400; }
        .recs-sub strong { color: #93c5fd; font-weight: 700; }

        .recs-role-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 26px; }
        .recs-chip {
          padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700;
          border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #64748b;
          text-decoration: none; transition: all 0.15s; letter-spacing: 0.04em; text-transform: uppercase;
        }
        .recs-chip:hover { border-color: rgba(59,130,246,0.4); color: #93c5fd; background: rgba(59,130,246,0.08); }
        .recs-chip.active { border-color: rgba(59,130,246,0.5); color: #60a5fa; background: rgba(59,130,246,0.12); }

        .recs-divider { text-align: center; position: relative; margin: 20px 0; }
        .recs-divider::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(255,255,255,0.07); }
        .recs-divider span { background: rgba(15,23,42,0.9); padding: 0 14px; font-size: 12px; color: #475569; position: relative; }

        .recs-footer { text-align: center; margin-top: 24px; font-size: 13px; color: #475569; }
        .recs-footer a { color: #60a5fa; font-weight: 700; text-decoration: none; }
        .recs-footer a:hover { text-decoration: underline; }

        .recs-back { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; margin-bottom: 20px; padding: 0; font-family: 'Inter', sans-serif; font-weight: 500; transition: color 0.15s; }
        .recs-back:hover { color: #94a3b8; }

        /* ══ OTP grid fix ══ */
        .recs-card .otp-row,
        .recs-card [class*="otp-row"],
        .recs-card [class*="otp_row"] {
          display: grid !important;
          grid-template-columns: repeat(6, 1fr) !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .recs-card .otp-row input,
        .recs-card [class*="otp-row"] input,
        .recs-card [class*="otp_row"] input {
          width: 100% !important;
          flex: unset !important;
          aspect-ratio: 1/1 !important;
          max-height: 60px !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }

        /* Child form overrides */
        .recs-card input {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: white !important;
          border-radius: 10px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important;
          box-sizing: border-box !important;
        }
        .recs-card input::placeholder { color: #475569 !important; }
        .recs-card input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important;
          background: rgba(59,130,246,0.06) !important;
        }
        .recs-card label {
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important; font-weight: 700 !important;
          color: #94a3b8 !important; letter-spacing: 0.06em !important; text-transform: uppercase !important;
        }
        .recs-card button[type="submit"] {
          background: #2563eb !important;
          border-radius: 10px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 14px !important; font-weight: 700 !important;
        }
        .recs-card button[type="submit"]:hover:not(:disabled) {
          background: #1d4ed8 !important;
          box-shadow: 0 0 20px rgba(37,99,235,0.4) !important;
        }
        .recs-card input[maxLength="1"],
        .recs-card input[maxlength="1"] {
          font-size: 22px !important; font-weight: 800 !important;
          text-align: center !important; color: white !important;
        }
        .recs-card input[maxLength="1"]:focus,
        .recs-card input[maxlength="1"]:focus {
          background: rgba(59,130,246,0.08) !important; border-color: #3b82f6 !important;
        }

        @media (max-width: 520px) { .recs-card { padding: 32px 24px 28px; } }
      `}</style>

      <Navbar />
      <div className="recs-page">
        <div className="recs-grid" /><div className="recs-glow" /><div className="recs-glow2" />
        <div className="recs-card">
          <div className="recs-badge">
            <div className="recs-badge-dot" />
            Recruiter Portal
          </div>
          <div className="recs-role-row">
            <Link to="/signup" className="recs-chip">Job Seeker</Link>
            <span className="recs-chip active">Recruiter</span>
            <Link to="/business/signup" className="recs-chip">Business</Link>
            <Link to="/admin/signup" className="recs-chip">Admin</Link>
          </div>
          {step === "signup" ? (
            <>
              <h1 className="recs-heading">Recruiter Sign Up</h1>
              <p className="recs-sub">Start hiring green energy talent today</p>
              <EmailSignup onOTPSent={handleOTPSent} role="recruiter" />
              <div className="recs-divider"><span>or</span></div>
              <GoogleSignIn />
            </>
          ) : (
            <>
              <button className="recs-back" type="button" onClick={handleBack}><ArrowLeft size={13} /> Back</button>
              <h1 className="recs-heading">Verify email</h1>
              <p className="recs-sub">Code sent to <strong style={{ color: "#93c5fd" }}>{email}</strong></p>
              <SignupVerifyOtp email={email} onBack={handleBack} />
            </>
          )}
          <div className="recs-footer">
            Already have an account? <Link to="/recruiter/login">Sign in</Link>
            {" · "}
            <Link to="/" style={{ color: "#475569" }}>Home</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecruiterSignup;