const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/otp");
const generateOtp = require("../utils/generateOtp");
const sendOtpEmail = require("../utils/sendOtpEmail");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * ============================
 * SEND SIGNUP OTP
 * ============================
 */
exports.sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    const otp = generateOtp();

    await Otp.create({
      email,
      otp,
      purpose: "signup",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    });

    await sendOtpEmail(email, otp);

    return res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error("Signup OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

/**
 * ============================
 * VERIFY SIGNUP OTP
 * ============================
 */
exports.verifySignupOtp = async (req, res) => {
  try {
    const { email, otp, role, mobile, name } = req.body;

    if (!email || !otp || !role || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const otpDoc = await Otp.findOne({
      email,
      otp,
      purpose: "signup",
    });

    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const user = await User.create({
      email,
      name,
      role,                 // jobseeker | recruiter | business | admin
      password: "OTP_AUTH", // dummy password (hash later if needed)
      isVerified: true,
      status: "active",
      ...(mobile && { mobile }),
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await otpDoc.deleteOne();

    return res.json({
      success: true,
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Verify Signup OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};

/**
 * ============================
 * SEND LOGIN OTP
 * ============================
 */
exports.sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found. Please signup.",
      });
    }

    const otp = generateOtp();

    await Otp.create({
      email,
      otp,
      purpose: "login",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error("Login OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

/**
 * ============================
 * VERIFY LOGIN OTP
 * ============================
 */
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpDoc = await Otp.findOne({
      email,
      otp,
      purpose: "login",
    });

    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const user = await User.findOne({ email });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await otpDoc.deleteOne();

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Verify Login OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
/**
 * ============================
 * GOOGLE SIGN-IN (LOGIN + SIGNUP)
 * ============================
 */
exports.googleAuth = async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    // ✅ Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    // 🆕 FIRST TIME GOOGLE USER
    if (!user) {
      if (!role) {
        return res.json({
          success: false,
          requireRole: true,
          message: "Role required for first-time Google signup",
        });
      }

      user = await User.create({
        email,
        name,
        role,                  // jobseeker | recruiter | business | admin
        password: "GOOGLE_AUTH",
        isVerified: true,
        status: "active",
      });
    }

    // 🔐 JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Google authentication successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};
