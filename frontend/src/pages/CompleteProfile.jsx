import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const CompleteProfile = () => {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);

  const API = "http://localhost:5000/api/profile";

  /* ======================
     REQUIRED FIELDS
  ====================== */
  const requiredFields = {
    jobseeker: [
      "fullName","mobile","city",
      "education","skills",
      "experience","resume"
    ],
    recruiter: [
      "companyName","companyWebsite",
      "companyDescription","companyLocation",
      "contactNumber","companyLogo",
      "industryType"
    ],
    business: [
      "businessName","category",
      "address","contactDetails",
      "description","images"
    ]
  };

  /* ======================
     PROGRESS CALCULATION
  ====================== */
  const progress = useMemo(() => {
    const fields = requiredFields[user.role] || [];
    const filled = fields.filter(f => form[f]).length;
    return Math.round((filled / fields.length) * 100);
  }, [form, user.role]);

  /* ====================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ======================
     RESUME UPLOAD (S3)
  ====================== */
  const handleResumeUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("resume", file);

    try {
      const res = await axios.post(
        `${API}/upload-resume`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setForm({ ...form, resume: res.data.resumeUrl });
      toast.success("Resume uploaded");

    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ======================
     SUBMIT PROFILE
  ====================== */
  const handleSubmit = async () => {
    if (progress < 100) {
      return toast.error("Complete all required fields");
    }

    try {
      let payload = { ...form };

      if (payload.skills) {
        payload.skills = payload.skills.split(",").map(s => s.trim());
      }

      const res = await axios.post(
        `${API}/complete`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Profile completed!");
      login(res.data.user, token);
      navigate("/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  /* ======================
     ROLE FIELDS
  ====================== */
  const renderFields = () => {
    switch (user.role) {

      case "jobseeker":
        return (
          <>
            <input name="fullName" placeholder="Full Name" onChange={handleChange}/>
            <input name="mobile" placeholder="Mobile" onChange={handleChange}/>
            <input name="city" placeholder="City" onChange={handleChange}/>
            <input name="education" placeholder="Education" onChange={handleChange}/>

            <input
              name="skills"
              placeholder="Skills (React, Node, Java)"
              onChange={handleChange}
            />

            <input name="experience" placeholder="Experience" onChange={handleChange}/>

            {/* Resume Upload */}
            <label>Upload Resume (PDF/DOC)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e)=>handleResumeUpload(e.target.files[0])}
            />

            {uploading && <p>Uploading...</p>}
            {form.resume && <p style={{color:"green"}}>Resume uploaded ✓</p>}
          </>
        );

      case "recruiter":
        return (
          <>
            <input name="companyName" placeholder="Company Name" onChange={handleChange}/>
            <input name="companyWebsite" placeholder="Website" onChange={handleChange}/>
            <input name="companyDescription" placeholder="Description" onChange={handleChange}/>
            <input name="companyLocation" placeholder="Location" onChange={handleChange}/>
            <input name="contactNumber" placeholder="Contact" onChange={handleChange}/>
            <input name="companyLogo" placeholder="Logo URL" onChange={handleChange}/>
            <input name="industryType" placeholder="Industry" onChange={handleChange}/>
          </>
        );

      case "business":
        return (
          <>
            <input name="businessName" placeholder="Business Name" onChange={handleChange}/>
            <input name="category" placeholder="Category" onChange={handleChange}/>
            <input name="address" placeholder="Address" onChange={handleChange}/>
            <input name="contactDetails" placeholder="Contact" onChange={handleChange}/>
            <input name="description" placeholder="Description" onChange={handleChange}/>
            <input
              name="images"
              placeholder="Image URLs (comma separated)"
              onChange={handleChange}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding:40, maxWidth:500, margin:"auto" }}>
      <h2>Complete Your Profile</h2>

      {/* PROGRESS BAR */}
      <div style={{ marginBottom:20 }}>
        <p>Profile Completion: {progress}%</p>

        <div style={{
          height:10,
          background:"#e5e7eb",
          borderRadius:5
        }}>
          <div style={{
            height:10,
            width:`${progress}%`,
            background: progress===100 ? "#16a34a" : "#4f46e5",
            borderRadius:5,
            transition:"0.3s"
          }} />
        </div>
      </div>

      {/* FORM */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {renderFields()}

        <button
          onClick={handleSubmit}
          disabled={progress < 100}
          style={{
            background: progress<100 ? "#9ca3af" : "#4f46e5",
            color:"white",
            padding:10,
            border:"none",
            borderRadius:5,
            cursor:"pointer"
          }}
        >
          Submit Profile
        </button>
      </div>
    </div>
  );
};

export default CompleteProfile;
