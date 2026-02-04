const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["jobseeker", "recruiter", "business", "admin"],
    required: true,
    index: true
  },

  /* ======================
     PROFILE STATUS
  ====================== */
  profileCompleted: {
    type: Boolean,
    default: false
  },

  profileProgress: {
    type: Number,
    default: 0
  },

  /* ======================
     JOB SEEKER PROFILE
  ====================== */
  jobSeekerProfile: {
    fullName: { type: String, trim: true },
    mobile: { type: String, trim: true },
    city: { type: String, trim: true },
    education: { type: String, trim: true },

    skills: {
      type: [String],
      default: []
    },

    experience: { type: String, trim: true },

    resume: {
      type: String, // S3 URL
      match: /^https?:\/\/.+/
    },

    // optional
    linkedin: String,
    portfolio: String,
    expectedSalary: String,
    preferredRole: String
  },

  /* ======================
     RECRUITER PROFILE
  ====================== */
  recruiterProfile: {
    companyName: String,
    companyWebsite: String,
    companyDescription: String,
    companyLocation: String,
    contactNumber: String,

    companyLogo: {
      type: String,
      match: /^https?:\/\/.+/
    },

    industryType: String
  },

  /* ======================
     BUSINESS PROFILE
  ====================== */
  businessProfile: {
    businessName: String,
    category: String,
    address: String,
    contactDetails: String,
    description: String,

    images: {
      type: [String],
      default: []
    }
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
