const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    mobile: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: {
        values: ["jobseeker", "recruiter", "business", "admin"],
        message: "{VALUE} is not a valid role",
      },
      required: [true, "Role is required"],
    },

    isVerified: { type: Boolean, default: false },
    status:     { type: String, enum: ["active", "inactive", "banned"], default: "active" },

    /* ======================
       PROFILE STATUS
    ====================== */
    profileCompleted: { type: Boolean, default: false },
    profileProgress:  { type: Number,  default: 0, min: 0, max: 100 },

    /* ======================
       JOB SEEKER PROFILE
    ====================== */
    jobSeekerProfile: {
      // ── Name ──────────────────────────────────────────────────────────────
      firstName: { type: String, trim: true, maxlength: [50,  "First name too long"] },
      lastName:  { type: String, trim: true, maxlength: [50,  "Last name too long"]  },
      fullName:  { type: String, trim: true, maxlength: [100, "Full name too long"]  },

      // ── Contact ───────────────────────────────────────────────────────────
      mobile:  { type: String, default: "" },

      // ── Location ──────────────────────────────────────────────────────────
      city:    { type: String, trim: true, maxlength: [50,  "City name too long"] },
      pincode: { type: String, trim: true, maxlength: [10,  "Pincode too long"]   },

      // ── Professional ──────────────────────────────────────────────────────
      about:         { type: String, trim: true, maxlength: [2000, "About too long"]       },
      education:     { type: String, trim: true, maxlength: [200,  "Education too long"]   },
      experience:    { type: String, trim: true, maxlength: [100,  "Experience too long"]  },
      accomplishments: { type: String, trim: true, maxlength: [2000, "Accomplishments too long"] },

      skills: {
        type: [String],
        default: [],
        validate: {
          validator: (v) => v.length <= 20,
          message: "Maximum 20 skills allowed",
        },
      },

      // ── Documents / Links ─────────────────────────────────────────────────
      resume:    { type: String },
      linkedin:  { type: String },
      portfolio: { type: String },

      // ── Preferences ───────────────────────────────────────────────────────
      expectedSalary: String,
      preferredRole:  { type: String, trim: true, maxlength: [100, "Role too long"] },
    },

    /* ======================
       RECRUITER PROFILE
    ====================== */
    recruiterProfile: {
      companyName:        { type: String, trim: true, maxlength: [100, "Company name too long"]  },
      companyWebsite:     { type: String },
      companyDescription: { type: String, trim: true, maxlength: [500, "Description too long"]   },
      companyLocation:    { type: String, trim: true, maxlength: [100, "Location too long"]       },
      contactNumber:      { type: String },
      companyLogo:        { type: String },
      industryType:       { type: String, trim: true, maxlength: [50,  "Industry too long"]       },
      linkedBusiness: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },

    /* ======================
       BUSINESS PROFILE
    ====================== */
    businessProfile: {
      businessName:   { type: String, trim: true, maxlength: [100,  "Business name too long"]  },
      category:       { type: String, trim: true, maxlength: [50,   "Category too long"]        },
      address:        { type: String, trim: true, maxlength: [500,  "Address too long"]         },
      contactDetails: { type: String, trim: true, maxlength: [200,  "Contact details too long"] },
      description:    { type: String, trim: true, maxlength: [1000, "Description too long"]     },

      images: {
        type: [String],
        default: [],
        validate: {
          validator: (v) => v.length <= 10,
          message: "Maximum 10 images allowed",
        },
      },

      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      verified:              { type: Boolean,   default: false },
      verificationDocuments: { type: [String],  default: []   },
    },

    /* ======================
       ADMIN PROFILE
    ====================== */
    adminProfile: {
      permissions: {
        type: [String],
        default: ["read", "write", "delete", "approve"],
      },
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ======================
   INDEXES
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
    business:  this.businessProfile,
    admin:     this.adminProfile,
  };
});

/* ======================
   PROFILE PROGRESS (sync)
====================== */
userSchema.methods.calculateProfileProgress = function () {
  const profileMap = {
    jobseeker: this.jobSeekerProfile,
    recruiter: this.recruiterProfile,
    business:  this.businessProfile,
  };

  // Fields that actually matter for progress per role
  const requiredFieldsMap = {
    jobseeker: ["firstName", "lastName", "mobile", "city", "pincode", "about", "education", "resume"],
    recruiter: ["companyName", "companyWebsite", "contactNumber", "companyDescription", "companyLocation", "industryType", "companyLogo"],
    business:  ["businessName", "category", "contactDetails", "address", "description"],
  };

  const profile        = profileMap[this.role]  || {};
  const requiredFields = requiredFieldsMap[this.role] || [];

  if (requiredFields.length === 0) {
    this.profileProgress  = 0;
    this.profileCompleted = false;
    return;
  }

  const completed = requiredFields.filter((field) => {
    const val = profile[field];
    if (Array.isArray(val)) return val.length > 0;
    return val && val.toString().trim() !== "";
  }).length;

  this.profileProgress  = Math.round((completed / requiredFields.length) * 100);
  this.profileCompleted = this.profileProgress >= 80;
};

/* ======================
   PRE SAVE MIDDLEWARE  ← fixed (was calling non-existent async version)
====================== */
userSchema.pre("save", function (next) {
  if (
    this.isModified("jobSeekerProfile") ||
    this.isModified("recruiterProfile") ||
    this.isModified("businessProfile")
  ) {
    this.calculateProfileProgress();
  }
  next();
});

/* ======================
   STATIC METHODS
====================== */
userSchema.statics.findByRole = function (role) {
  return this.find({ role }).select("-password");
};

userSchema.statics.getApprovedBusinesses = function () {
  return this.find({ role: "business", "businessProfile.status": "approved" })
    .select("name businessProfile");
};

userSchema.statics.getBusinessById = function (businessId) {
  return this.findById(businessId).select("businessProfile name");
};

module.exports = mongoose.model("User", userSchema);