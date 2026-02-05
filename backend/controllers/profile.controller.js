const User = require("../models/User");
const s3 = require("../config/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

/* =========================
   HELPER: PROFILE PROGRESS
========================= */
const calculateProgress = (requiredFields,data)=>{
  const filled = requiredFields.filter(
    f => data[f] && data[f].toString().trim() !== ""
  ).length;

  return Math.round((filled/requiredFields.length)*100);
};

/* =========================
   COMPLETE PROFILE
========================= */
exports.completeProfile = async (req,res)=>{
  try{
    const user = await User.findById(req.user.id);
    const data = req.body;

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    let required=[];
    let progress=0;

    /* ===== JOBSEEKER ===== */
    if(user.role==="jobseeker"){
      required=[
        "fullName","mobile","city",
        "education","skills",
        "experience","resume"
      ];

      progress = calculateProgress(required,data);

      if(progress<100){
        return res.status(400).json({
          success:false,
          message:"Fill all required fields"
        });
      }

      user.jobSeekerProfile={
        ...user.jobSeekerProfile,
        ...data
      };
    }

    /* ===== RECRUITER ===== */
    if(user.role==="recruiter"){
      required=[
        "companyName","companyWebsite",
        "companyDescription","companyLocation",
        "contactNumber","companyLogo",
        "industryType"
      ];

      progress=calculateProgress(required,data);

      if(progress<100){
        return res.status(400).json({
          success:false,
          message:"Fill all required fields"
        });
      }

      user.recruiterProfile={
        ...user.recruiterProfile,
        ...data
      };
    }

    /* ===== BUSINESS ===== */
    if(user.role==="business"){
      required=[
        "businessName","category",
        "address","contactDetails",
        "description","images"
      ];

      progress=calculateProgress(required,data);

      if(!data.images || data.images.length<1){
        return res.status(400).json({
          success:false,
          message:"At least one image required"
        });
      }

      user.businessProfile={
        ...user.businessProfile,
        ...data
      };
    }

    /* ===== ADMIN ===== */
    if(user.role==="admin"){
      progress=100;
    }

    user.profileCompleted=true;
    user.profileProgress=progress;

    await user.save();

    res.json({
      success:true,
      message:"Profile completed",
      profileProgress:progress,
      user
    });

  }catch(err){
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
exports.getMyProfile = async (req,res)=>{
  try{
    const user = await User
      .findById(req.user.id)
      .select("-password");

    res.json({ success:true,user });

  }catch{
    res.status(500).json({
      success:false,
      message:"Failed to fetch profile"
    });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    /* =========================
       DELETE OLD RESUME (SAFE)
    ========================= */
    const oldResumeUrl = user.jobSeekerProfile?.resume;

    if (oldResumeUrl) {
      try {
        const url = new URL(oldResumeUrl);
        const key = decodeURIComponent(url.pathname.substring(1));

        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
          })
        );

        console.log("Old resume deleted:", key);

      } catch (err) {
        console.log("Old resume delete failed (ignored):", err.message);
      }
    }

    /* =========================
       SAVE NEW RESUME
    ========================= */
    user.jobSeekerProfile = {
      ...user.jobSeekerProfile,
      resume: req.file.location
    };

    await user.save();

    res.json({
      success: true,
      message: "Resume uploaded",
      resumeUrl: req.file.location
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Resume upload failed"
    });
  }
};

/* =========================
   UPLOAD RECRUITER LOGO
========================= */
exports.uploadLogo = async (req,res)=>{
  try{
    if(!req.file){
      return res.status(400).json({
        success:false,
        message:"No logo uploaded"
      });
    }

    const user=await User.findById(req.user.id);

    const oldLogo=user.recruiterProfile?.companyLogo;

    /* DELETE OLD */
    if(oldLogo){
      try{
        const key=oldLogo.split(".amazonaws.com/")[1];
        if(key){
          await s3.send(new DeleteObjectCommand({
            Bucket:process.env.AWS_S3_BUCKET_NAME,
            Key:key
          }));
        }
      }catch{}
    }

    user.recruiterProfile={
      ...user.recruiterProfile,
      companyLogo:req.file.location
    };

    await user.save();

    res.json({
      success:true,
      logo:req.file.location
    });

  }catch{
    res.status(500).json({
      success:false,
      message:"Logo upload failed"
    });
  }
};

/* =========================
   UPLOAD BUSINESS IMAGES
========================= */
exports.uploadBusinessImages = async (req,res)=>{
  try{
    if(!req.files || !req.files.length){
      return res.status(400).json({
        success:false,
        message:"No images uploaded"
      });
    }

    const user=await User.findById(req.user.id);

    const urls=req.files.map(f=>f.location);

    user.businessProfile={
      ...user.businessProfile,
      images:[
        ...(user.businessProfile?.images||[]),
        ...urls
      ]
    };

    await user.save();

    res.json({
      success:true,
      images:urls
    });

  }catch{
    res.status(500).json({
      success:false,
      message:"Business images upload failed"
    });
  }
};
