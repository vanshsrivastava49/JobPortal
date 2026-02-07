const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
{
  title: String,
  company: String,
  location: String,
  salary: String,
  description: String,
  skills: [String],

  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
