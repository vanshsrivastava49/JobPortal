import React, { useState } from "react";

const GoogleRoleModal = ({ onSubmit }) => {
  const [role, setRole] = useState("");

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Select Your Role</h3>
        <p style={{ color: "#6b7280" }}>
          Please select a role to complete signup
        </p>

        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginBottom: "20px" }}
        >
          <option value="">Select role</option>
          <option value="jobseeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
          <option value="business">Business Owner</option>
        </select>

        <button
          className="btn btn-primary"
          disabled={!role}
          onClick={() => onSubmit(role)}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  width: "100%",
  maxWidth: "400px",
};

export default GoogleRoleModal;
