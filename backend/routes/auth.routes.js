const router = require("express").Router();
const auth = require("../middleware/auth");
const rateLimit = require("express-rate-limit"); //Added rate limiting

const {
  googleAuth,
  sendSignupOtp,
  verifySignupOtp,
  sendLoginOtp,
  verifyLoginOtp,
  logout
} = require("../controllers/auth.controller");

//OTP Rate Limiter: Max 5 requests per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: { success: false, message: "Too many OTP requests. Please try again later." }
});

router.post("/google", googleAuth);
router.post("/signup/send-otp", otpLimiter, sendSignupOtp);
router.post("/signup/verify-otp", verifySignupOtp);
router.post("/login/send-otp", otpLimiter, sendLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);
router.post("/logout", auth, logout);

module.exports = router;