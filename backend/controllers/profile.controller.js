const User = require("../models/User");
const s3 = require("../config/s3");

/* =========================
   HELPER: PROFILE PROGRESS
========================= */
const calculateProgress = (requiredFields, data) => {
  const filled = requiredFields.filter(
    (field) => data[field] && data[field].toString().trim() !== ""
  ).length;

  return Math.round((filled / requiredFields.length) * 100);
};

/* =========================
   COMPLETE PROFILE
========================= */
exports.completeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const data = req.body;

    if (!user) {
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    let required = [];
    let progress = 0;

    /* ===== JOBSEEKER ===== */
    if (user.role === "jobseeker") {
      required = [
        "fullName","mobile","city",
        "education","skills",
        "experience","resume"
      ];

      progress = calculateProgress(required, data);

      if (progress < 100) {
        return res.status(400).json({
          success:false,
          message:"Please fill all required fields"
        });
      }

      user.jobSeekerProfile = {
        ...user.jobSeekerProfile,
        ...data
      };
    }

    /* ===== RECRUITER ===== */
    if (user.role === "recruiter") {
      required = [
        "companyName","companyWebsite",
        "companyDescription","companyLocation",
        "contactNumber","companyLogo",
        "industryType"
      ];

      progress = calculateProgress(required, data);

      if (progress < 100) {
        return res.status(400).json({
          success:false,
          message:"Please fill all required fields"
        });
      }

      user.recruiterProfile = {
        ...user.recruiterProfile,
        ...data
      };
    }

    /* ===== BUSINESS ===== */
    if (user.role === "business") {
      required = [
        "businessName","category",
        "address","contactDetails",
        "description","images"
      ];

      progress = calculateProgress(required, data);

      if (!data.images || data.images.length < 1) {
        return res.status(400).json({
          success:false,
          message:"At least one image required"
        });
      }

      user.businessProfile = {
        ...user.businessProfile,
        ...data
      };
    }

    /* ===== ADMIN ===== */
    if (user.role === "admin") {
      progress = 100;
    }

    user.profileCompleted = true;
    user.profileProgress = progress;

    await user.save();

    res.json({
      success:true,
      message:"Profile completed",
      profileProgress:progress,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success:false,
      message:"Profile update failed"
    });
  }
};


/* =========================
   GET MY PROFILE
========================= */
exports.getMyProfile = async (req,res) => {
  try {
    const user = await User
      .findById(req.user.id)
      .select("-password");

    res.json({ success:true, user });

  } catch (err) {
    res.status(500).json({
      success:false,
      message:"Failed to fetch profile"
    });
  }
};


/* =========================
   UPLOAD RESUME (DELETE OLD)
========================= */
exports.uploadResume = async (req,res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success:false,
        message:"No file uploaded"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    /* ===== DELETE OLD RESUME SAFELY ===== */
    const oldResumeUrl = user.jobSeekerProfile?.resume;

    if (oldResumeUrl) {
      try {
        const key = oldResumeUrl.split(".amazonaws.com/")[1];

        if (key) {
          await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
          }).promise();

          console.log("Old resume deleted:", key);
        }

      } catch (err) {
        console.log("Old resume delete skipped");
      }
    }

    /* ===== SAVE NEW ===== */
    user.jobSeekerProfile = {
      ...user.jobSeekerProfile,
      resume: req.file.location
    };

    /* ===== UPDATE PROFILE PROGRESS ===== */
    const required = [
      "fullName","mobile","city",
      "education","skills",
      "experience","resume"
    ];

    const progress = calculateProgress(
      required,
      user.jobSeekerProfile
    );

    user.profileProgress = progress;
    user.profileCompleted = progress === 100;

    await user.save();

    res.json({
      success:true,
      message:"Resume uploaded",
      resumeUrl:req.file.location,
      profileProgress:progress
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success:false,
      message:"Resume upload failed"
    });
  }
};
