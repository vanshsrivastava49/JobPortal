const router = require("express").Router();
const { googleAuth } = require("../controllers/auth.controller");
router.post("/google", googleAuth);
const {
  sendSignupOtp,
  verifySignupOtp,
  sendLoginOtp,
  verifyLoginOtp,
} = require("../controllers/auth.controller");

router.post("/signup/send-otp", sendSignupOtp);
router.post("/signup/verify-otp", verifySignupOtp);

router.post("/login/send-otp", sendLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);

module.exports = router;
