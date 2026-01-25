import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import GoogleRoleModal from "./GoogleRoleModal";

const GoogleSignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [googleToken, setGoogleToken] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await apiClient.post("/auth/google", {
        token: credentialResponse.credential,
      });

      if (res.data.requireRole) {
        setGoogleToken(credentialResponse.credential);
        setShowRoleModal(true);
        return;
      }

      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch {
      toast.error("Google sign-in failed");
    }
  };

  const handleRoleSubmit = async (role) => {
    try {
      const res = await apiClient.post("/auth/google", {
        token: googleToken,
        role,
      });

      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch {
      toast.error("Google signup failed");
    }
  };

  return (
    <>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google sign-in failed")}
        width="100%"
      />

      {showRoleModal && (
        <GoogleRoleModal onSubmit={handleRoleSubmit} />
      )}
    </>
  );
};

export default GoogleSignIn;
