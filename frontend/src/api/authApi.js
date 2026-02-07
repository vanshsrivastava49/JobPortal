import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ======================================================
   AXIOS INSTANCE
====================================================== */
const authApi = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================================================
   OPTIONAL: AUTO ATTACH TOKEN
====================================================== */
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ======================================================
   SEND OTP (LOGIN / SIGNUP)
   - Supports CAPTCHA
====================================================== */
export const sendOTP = async (
  email,
  type = "login",
  captchaToken = null
) => {
  const endpoint =
    type === "signup"
      ? "/signup/send-otp"
      : "/login/send-otp";

  const payload = { email };

  // Attach captcha only if provided
  if (captchaToken) {
    payload.captchaToken = captchaToken;
  }

  const response = await authApi.post(endpoint, payload);

  return response.data;
};

/* ======================================================
   VERIFY OTP (LOGIN / SIGNUP)
====================================================== */
export const verifyOTP = async (
  email,
  otp,
  role = null,
  mobile = null,
  name = null,
  type = "login"
) => {
  const endpoint =
    type === "signup"
      ? "/signup/verify-otp"
      : "/login/verify-otp";

  const payload = { email, otp };

  // Signup-only fields
  if (type === "signup") {
    payload.role = role;
    payload.mobile = mobile;
    payload.name = name;
  }

  const response = await authApi.post(endpoint, payload);

  return response.data;
};

/* ======================================================
   LOGOUT
====================================================== */
export const logoutUser = async () => {
  const response = await authApi.post("/logout");
  return response.data;
};

export default authApi;
