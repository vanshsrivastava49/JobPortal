const User = require("../models/User");
const Otp = require("../models/otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateOtp = require("../utils/generateOtp");
const sendOtpEmail = require("../utils/sendOtpEmail");

/* ===================== SIGNUP ===================== */

// Send OTP for signup
exports.sendSignupOtp = async (req, res) => {
  const { email } = req.body;

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "User already exists" });

  const otp = generateOtp();

  await Otp.create({
    email,
    otp,
    purpose: "signup",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  await sendOtpEmail(email, otp);
  res.json({ message: "Signup OTP sent to email" });
};

// Verify signup OTP and create user
exports.verifySignupOtp = async (req, res) => {
  const { name, email, password, role, otp } = req.body;

  const record = await Otp.findOne({
    email,
    otp,
    purpose: "signup",
    expiresAt: { $gt: new Date() }
  });

  if (!record)
    return res.status(400).json({ message: "Invalid or expired OTP" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    isVerified: true
  });

  await Otp.deleteMany({ email });

  res.json({ message: "Account created successfully" });
};
exports.sendLoginOtp = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  if (!user.isVerified)
    return res.status(403).json({ message: "Email not verified" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ message: "Invalid credentials" });

  const otp = generateOtp();

  await Otp.create({
    email,
    otp,
    purpose: "login",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  await sendOtpEmail(email, otp);
  res.json({ message: "Login OTP sent" });
};

// Verify login OTP and issue JWT
exports.verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;

  const record = await Otp.findOne({
    email,
    otp,
    purpose: "login",
    expiresAt: { $gt: new Date() }
  });

  if (!record)
    return res.status(400).json({ message: "Invalid or expired OTP" });

  const user = await User.findOne({ email });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  await Otp.deleteMany({ email });

  res.json({ token, role: user.role });
};