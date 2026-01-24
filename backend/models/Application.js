const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  jobSeekerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resumeUrl: String,
  status: { type: String, default: "applied" }
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);
