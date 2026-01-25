import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Axios instance for auth APIs
 */
const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ============================
 * SEND OTP (LOGIN / SIGNUP)
 * ============================
 */
export const sendOTP = async (email, type = "login") => {
  const endpoint =
    type === "signup" ? "/signup/send-otp" : "/login/send-otp";

  const response = await authApi.post(endpoint, { email });
  return response.data;
};
export const verifyOTP = async (
  email,
  otp,
  role,
  mobile,
  name,
  type = "login"
) => {
  const endpoint =
    type === "signup"
      ? "/signup/verify-otp"
      : "/login/verify-otp";

  const payload = {
    email,
    otp,
    role,
    mobile,
  };
  if (type === "signup") {
    payload.name = name;
  }

  const response = await authApi.post(endpoint, payload);
  return response.data;
};


export default authApi;