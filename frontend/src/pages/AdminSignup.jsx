import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import EmailSignup from "../components/Auth/EmailSignup";
import SignupVerifyOtp from "../components/Auth/SignupVerifyOtp";
import Navbar from "../components/common/Navbar";

const AdminSignup = () => {
  const [step,      setStep]      = useState("signup");
  const [email,     setEmail]     = useState("");
  const [role,      setRole]      = useState("admin");
  const [confirmed, setConfirmed] = useState(false);
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.profileCompleted ? "/admin/dashboard" : "/complete-profile"} replace />;
  }

  const handleOTPSent = (userEmail, userRole) => {
    setEmail(userEmail);
    setRole(userRole);
    setStep("verify");
  };
  const handleBack = () => { setStep("signup"); setEmail(""); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .adms-page { min-height: calc(100vh - 82px); background: #052e16; display: flex; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; position: relative; overflow: hidden; }

        .adms-circles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .adms-circle { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.06); }
        .adms-c1 { width: 600px; height: 600px; top: -220px; left: -220px; }
        .adms-c2 { width: 400px; height: 400px; top: 80px; right: -150px; }
        .adms-c3 { width: 240px; height: 240px; bottom: 100px; left: 60px; border-color: rgba(16,185,129,0.2); }
        .adms-glow { position: fixed; inset: 0; pointer-events: none; z-index: 0; background-image: radial-gradient(circle at 70% 20%, rgba(16,185,129,0.15) 0%, transparent 60%); }

        .adms-container { position: relative; z-index: 2; width: 100%; max-width: 460px; }

        .adms-statusbar { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px 8px 0 0; padding: 10px 18px; display: flex; align-items: center; justify-content: space-between; font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 500; }
        .adms-status-left { display: flex; align-items: center; gap: 8px; }
        .adms-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #6ee7b7; animation: admsBlink 2s ease-in-out infinite; }
        @keyframes admsBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .adms-status-text { color: #6ee7b7; font-weight: 700; letter-spacing: 0.05em; }

        .adms-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-top: none; border-radius: 0 0 12px 12px; padding: 36px 40px 32px; animation: admsIn 0.4s ease both; backdrop-filter: blur(8px); }
        @keyframes admsIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .adms-shield-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .adms-shield-icon { width: 44px; height: 44px; border: 1px solid rgba(110,231,183,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(16,185,129,0.1); }
        .adms-shield-title { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.2px; }
        .adms-shield-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; font-weight: 400; }

        .adms-heading { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 4px; letter-spacing: -0.4px; }
        .adms-heading span { color: #6ee7b7; }
        .adms-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 24px; font-weight: 400; }

        .adms-gate { background: rgba(16,185,129,0.05); border: 1px solid rgba(110,231,183,0.2); border-radius: 8px; padding: 18px 20px; margin-bottom: 24px; }
        .adms-gate-title { font-size: 12px; font-weight: 700; color: #6ee7b7; margin-bottom: 8px; display: flex; align-items: center; gap: 7px; letter-spacing: 0.02em; }
        .adms-gate-desc { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.6; margin-bottom: 14px; font-weight: 400; }
        .adms-gate-check { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
        .adms-gate-checkbox { width: 16px; height: 16px; border: 1px solid rgba(255,255,255,0.15); border-radius: 3px; background: rgba(255,255,255,0.05); flex-shrink: 0; margin-top: 1px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; }
        .adms-gate-checkbox.checked { border-color: #10b981; background: rgba(16,185,129,0.15); }
        .adms-gate-check-text { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.5; font-weight: 500; }

        .adms-card .otp-row, .adms-card [class*="otp-row"], .adms-card [class*="otp_row"] { display: grid !important; grid-template-columns: repeat(6, 1fr) !important; gap: 8px !important; width: 100% !important; }
        .adms-card .otp-row input, .adms-card [class*="otp-row"] input, .adms-card [class*="otp_row"] input { width: 100% !important; flex: unset !important; aspect-ratio: 1/1 !important; max-height: 56px !important; padding: 0 !important; box-sizing: border-box !important; }

        .adms-card input { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; font-family: 'Inter', sans-serif !important; font-size: 14px !important; color: #fff !important; box-sizing: border-box !important; }
        .adms-card input::placeholder { color: rgba(255,255,255,0.2) !important; }
        .adms-card input:focus { border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.12) !important; }
        .adms-card label { font-family: 'Inter', sans-serif !important; font-size: 11px !important; font-weight: 700 !important; color: rgba(255,255,255,0.4) !important; letter-spacing: 0.08em !important; text-transform: uppercase !important; }
        .adms-card button[type="submit"] { background: linear-gradient(135deg, #14532d, #166534) !important; color: #fff !important; border: 1px solid rgba(110,231,183,0.3) !important; border-radius: 8px !important; font-family: 'Inter', sans-serif !important; font-size: 14px !important; font-weight: 700 !important; }
        .adms-card button[type="submit"]:hover:not(:disabled) { background: linear-gradient(135deg, #166534, #15803d) !important; transform: translateY(-1px) !important; box-shadow: 0 4px 12px rgba(5,46,22,0.4) !important; }
        .adms-card input[maxLength="1"], .adms-card input[maxlength="1"] { font-size: 22px !important; font-weight: 800 !important; text-align: center !important; color: #6ee7b7 !important; }
        .adms-card input[maxLength="1"]:focus, .adms-card input[maxlength="1"]:focus { background: rgba(16,185,129,0.08) !important; border-color: #10b981 !important; }

        .adms-back { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 20px; padding: 0; font-family: 'Inter', sans-serif; font-weight: 500; transition: color 0.15s; }
        .adms-back:hover { color: #6ee7b7; }

        .adms-footer { text-align: center; margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.25); }
        .adms-footer a { color: rgba(255,255,255,0.4); text-decoration: none; font-weight: 500; }
        .adms-footer a:hover { color: #6ee7b7; }

        .adms-disabled { opacity: 0.4; pointer-events: none; }

        @media (max-width: 480px) { .adms-card { padding: 28px 24px 24px; } }
      `}</style>

      <Navbar />
      <div className="adms-page">
        <div className="adms-circles">
          <div className="adms-circle adms-c1" />
          <div className="adms-circle adms-c2" />
          <div className="adms-circle adms-c3" />
        </div>
        <div className="adms-glow" />
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
              <div className="adms-shield-icon"><ShieldCheck size={22} color="#6ee7b7" /></div>
              <div>
                <div className="adms-shield-title">Admin Registration</div>
                <div className="adms-shield-sub">By invitation only</div>
              </div>
            </div>
            {step === "signup" ? (
              <>
                <h1 className="adms-heading"><span>Register</span></h1>
                <p className="adms-sub">Admin access requires authorisation</p>
                <div className="adms-gate">
                  <div className="adms-gate-title">
                    <AlertTriangle size={13} color="#6ee7b7" />
                    Restricted Access Zone
                  </div>
                  <div className="adms-gate-desc">
                    Admin accounts have full platform access. Registration requires a valid invitation code and will be reviewed before activation.
                  </div>
                  <label className="adms-gate-check" onClick={() => setConfirmed(c => !c)}>
                    <div className={`adms-gate-checkbox ${confirmed ? "checked" : ""}`}>
                      {confirmed && <span style={{ color: "#6ee7b7", fontSize: 10, fontWeight: 800 }}>✓</span>}
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
                <SignupVerifyOtp email={email} onBack={handleBack} role={role} />
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