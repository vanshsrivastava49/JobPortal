const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/otp");
const generateOtp = require("../utils/generateOtp");
const sendOtpEmail = require("../utils/sendOtpEmail");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });

    const otp = generateOtp();

    await Otp.deleteMany({ email, purpose: "signup" });

    await Otp.create({
      email,
      otp,
      purpose: "signup",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(email, otp);

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

exports.verifySignupOtp = async (req, res) => {
  try {
    const { email, otp, role, name, mobile } = req.body;

    if (!email || !otp || !role || !name)
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });

    const otpDoc = await Otp.findOne({
      email,
      otp,
      purpose: "signup",
    });

    if (!otpDoc || otpDoc.expiresAt < new Date())
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });

    const user = await User.create({
      email,
      name,
      role,
      mobile,
      password: "OTP_AUTH",
      isVerified: true,
      status: "active",
    });

    await otpDoc.deleteOne();

    const token = createToken(user);

    const fullUser = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      message: "Signup successful",
      user: fullUser,
      token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Signup failed" });
  }
};

exports.sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "User not found",
      });

    const otp = generateOtp();

    await Otp.deleteMany({ email, purpose: "login" });

    await Otp.create({
      email,
      otp,
      purpose: "login",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(email, otp);

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({
        success: false,
        message: "Email & OTP required",
      });

    const otpDoc = await Otp.findOne({
      email,
      otp,
      purpose: "login",
    });

    if (!otpDoc || otpDoc.expiresAt < new Date())
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });

    const user = await User.findOne({ email }).select("-password");

    await otpDoc.deleteOne();

    const token = createToken(user);

    res.json({
      success: true,
      message: "Login successful",
      user,
      token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!token)
      return res.status(400).json({
        success: false,
        message: "Google token required",
      });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      if (!role)
        return res.json({
          success: false,
          requireRole: true,
          message: "Role required for first-time signup",
        });

      user = await User.create({
        email,
        name,
        role,
        password: "GOOGLE_AUTH",
        isVerified: true,
        status: "active",
      });
    }

    const jwtToken = createToken(user);

    const fullUser = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      message: "Google authentication successful",
      user: fullUser,
      token: jwtToken,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};