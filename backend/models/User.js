const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"]
    },

    email: {
      type: String,
      unique: true, // unique automatically creates index
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, "Please enter a valid email"]
    },

    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"]
    },

    role: {
      type: String,
      enum: {
        values: ["jobseeker", "recruiter", "business", "admin"],
        message: "{VALUE} is not a valid role"
      },
      required: [true, "Role is required"]
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
      default: 0,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100"]
    },

    /* ======================
       JOB SEEKER PROFILE
    ====================== */
    jobSeekerProfile: {
      fullName: { type: String, trim: true, maxlength: [100, "Full name too long"] },
      mobile: { type: String, match: [/^\+?[\d\s-]{10,15}$/, "Invalid mobile number"] },
      city: { type: String, trim: true, maxlength: [50, "City name too long"] },
      education: { type: String, trim: true, maxlength: [200, "Education too long"] },
      skills: {
        type: [String],
        default: [],
        validate: {
          validator: function (v) {
            return v.length <= 20;
          },
          message: "Maximum 20 skills allowed"
        }
      },
      experience: { type: String, trim: true, maxlength: [100, "Experience too long"] },
      resume: { type: String, match: [/^https?:\/\/.+/, "Resume must be a valid URL"] },
      linkedin: { type: String, match: [/^https?:\/\/(www\.)?linkedin\.com/, "Invalid LinkedIn URL"] },
      portfolio: { type: String, match: [/^https?:\/\/.+/, "Portfolio must be a valid URL"] },
      expectedSalary: String,
      preferredRole: { type: String, trim: true, maxlength: [100, "Role too long"] }
    },

    /* ======================
       RECRUITER PROFILE
    ====================== */
    recruiterProfile: {
      companyName: { type: String, trim: true, maxlength: [100, "Company name too long"] },
      companyWebsite: { type: String, match: [/^https?:\/\/.+/, "Invalid website URL"] },
      companyDescription: { type: String, trim: true, maxlength: [500, "Description too long"] },
      companyLocation: { type: String, trim: true, maxlength: [100, "Location too long"] },
      contactNumber: { type: String, match: [/^\+?[\d\s-]{10,15}$/, "Invalid contact number"] },
      companyLogo: { type: String, match: [/^https?:\/\/.+/, "Logo must be a valid URL"] },
      industryType: { type: String, trim: true, maxlength: [50, "Industry too long"] },
      linkedBusiness: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      }
    },

    /* ======================
       BUSINESS PROFILE
    ====================== */
    businessProfile: {
      businessName: { type: String, trim: true, maxlength: [100, "Business name too long"] },
      category: { type: String, trim: true, maxlength: [50, "Category too long"] },
      address: { type: String, trim: true, maxlength: [500, "Address too long"] },
      contactDetails: { type: String, trim: true, maxlength: [200, "Contact details too long"] },
      description: { type: String, trim: true, maxlength: [1000, "Description too long"] },
      images: {
        type: [String],
        default: [],
        validate: {
          validator: function (v) {
            return v.length <= 10;
          },
          message: "Maximum 10 images allowed"
        }
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
      },
      verified: { type: Boolean, default: false },
      verificationDocuments: { type: [String], default: [] }
    },

    /* ======================
       ADMIN FIELDS
    ====================== */
    adminProfile: {
      permissions: {
        type: [String],
        default: ["read", "write", "delete", "approve"]
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* ======================
   INDEXES (Clean & Non-Duplicate)
====================== */
userSchema.index({ role: 1 });
userSchema.index({ "businessProfile.status": 1 });
userSchema.index({ "recruiterProfile.linkedBusiness": 1 });

/* ======================
   VIRTUAL FIELD
====================== */
userSchema.virtual("fullProfile").get(function () {
  return {
    jobSeeker: this.jobSeekerProfile,
    recruiter: this.recruiterProfile,
    business: this.businessProfile,
    admin: this.adminProfile
  };
});

/* ======================
   PROFILE PROGRESS
====================== */
userSchema.methods.calculateProfileProgress = function () {
  let totalFields = 0;
  let completedFields = 0;

  const profile =
    this.role === "jobseeker"
      ? this.jobSeekerProfile
      : this.role === "recruiter"
      ? this.recruiterProfile
      : this.role === "business"
      ? this.businessProfile
      : {};

  const fields = Object.keys(profile || {});
  totalFields = fields.length;

  fields.forEach((field) => {
    const value = profile[field];
    if (
      value &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0)
    ) {
      completedFields++;
    }
  });

  this.profileProgress =
    totalFields === 0 ? 0 : Math.round((completedFields / totalFields) * 100);

  this.profileCompleted = this.profileProgress >= 80;
};

/* ======================
   PRE SAVE MIDDLEWARE
====================== */
userSchema.pre("save", async function () {
  if (this.isModified("jobSeekerProfile") || 
      this.isModified("recruiterProfile") || 
      this.isModified("businessProfile")) {
    await this.calculateProfileProgressAsync(); // some async version
  }
});

/* ======================
   STATIC METHODS
====================== */
userSchema.statics.findByRole = function (role) {
  return this.find({ role }).select("-password");
};

userSchema.statics.getApprovedBusinesses = function () {
  return this.find({
    role: "business",
    "businessProfile.status": "approved"
  }).select("name businessProfile");
};

userSchema.statics.getBusinessById = function (businessId) {
  return this.findById(businessId).select("businessProfile name");
};

module.exports = mongoose.model("User", userSchema);
