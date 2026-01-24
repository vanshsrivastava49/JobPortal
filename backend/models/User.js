const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["jobseeker", "recruiter", "business", "admin"],
      required: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true });
module.exports = mongoose.model("User", userSchema);