import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import "./CompleteProfile.css";

const CompleteProfile = () => {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [currentSection, setCurrentSection] = useState("basicDetails");
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  const API = "http://localhost:5000/api/profile";

  /* ======================
     SECTION CONFIGURATIONS
  ====================== */
  const sections = {
    jobseeker: [
      { id: "basicDetails", label: "Basic Details", icon: "👤", required: true },
      { id: "resume", label: "Resume", icon: "📄", required: true },
      { id: "about", label: "About", icon: "ℹ️", required: true },
      { id: "skills", label: "Skills", icon: "⚡", required: true },
      { id: "education", label: "Education", icon: "🎓", required: true },
      { id: "experience", label: "Work Experience", icon: "💼", required: false },
      { id: "accomplishments", label: "Accomplishments & Initiatives", icon: "🏆", required: false }
    ],
    recruiter: [
      { id: "basicDetails", label: "Company Basics", icon: "🏢", required: true },
      { id: "companyDetails", label: "Company Details", icon: "📋", required: true },
      { id: "branding", label: "Branding", icon: "🎨", required: true }
    ],
    business: [
      { id: "basicDetails", label: "Business Info", icon: "🏪", required: true },
      { id: "businessDetails", label: "Business Details", icon: "📝", required: true },
      { id: "media", label: "Media", icon: "📸", required: true }
    ]
  };

  /* ======================
     REQUIRED FIELDS BY SECTION
  ====================== */
  const requiredFieldsBySection = {
    jobseeker: {
      basicDetails: ["fullName", "mobile", "city"],
      resume: ["resume"],
      about: ["about"],
      skills: ["skills"],
      education: ["education"],
      experience: [],
      accomplishments: []
    },
    recruiter: {
      basicDetails: ["companyName", "companyWebsite", "contactNumber"],
      companyDetails: ["companyDescription", "companyLocation", "industryType"],
      branding: ["companyLogo"]
    },
    business: {
      basicDetails: ["businessName", "category", "contactDetails"],
      businessDetails: ["address", "description"],
      media: ["images"]
    }
  };

  /* ======================
     SKILL SUGGESTIONS
  ====================== */
  const skillSuggestions = [
    "Data Quality Management",
    "BMC Helix ITSM (Remedy)",
    "HTML",
    "Social Recruiting",
    "Machine Learning Concepts",
    "E-Discovery",
    "Embedded programming",
    "GDPR Compliance",
    "Asana (Software)",
    "Education Law",
    "React",
    "Node.js",
    "Python",
    "JavaScript",
    "TypeScript",
    "MongoDB",
    "SQL",
    "AWS",
    "Docker",
    "Git"
  ];

  /* ======================
     PROGRESS CALCULATION
  ====================== */
  const getSectionProgress = (sectionId) => {
    const fields = requiredFieldsBySection[user.role]?.[sectionId] || [];
    if (fields.length === 0) return 100;
    
    const filled = fields.filter(f => {
      if (f === "skills") return selectedSkills.length > 0;
      if (f === "images") return form[f] && form[f].length > 0;
      return form[f];
    }).length;
    
    return Math.round((filled / fields.length) * 100);
  };

  const overallProgress = useMemo(() => {
    const userSections = sections[user.role] || [];
    const requiredSections = userSections.filter(s => s.required);
    
    const totalProgress = requiredSections.reduce((acc, section) => {
      return acc + getSectionProgress(section.id);
    }, 0);
    
    return Math.round(totalProgress / requiredSections.length);
  }, [form, user.role, selectedSkills]);

  /* ======================
     HANDLERS
  ====================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleSkillInputKeyPress = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      handleAddSkill(skillInput.trim());
    }
  };

  /* ======================
     LOGOUT
  ====================== */
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // Even if backend fails, still logout locally
    } finally {
      logout();
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  /* ======================
     FILE UPLOAD
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
      toast.success("Resume uploaded successfully");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("logo", file);

    try {
      const res = await axios.post(
        `${API}/upload-logo`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setForm({ ...form, companyLogo: res.data.logoUrl });
      toast.success("Logo uploaded!");
    } catch {
      toast.error("Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ✅ FIXED: Business Images Upload Handler
  const handleBusinessImagesUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const data = new FormData();
    
    // Append multiple files
    Array.from(files).forEach(file => {
      data.append("images", file);
    });

    try {
      const res = await axios.post(
        `${API}/upload-business-images`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Merge new images with existing ones
      const currentImages = form.images ? [...form.images] : [];
      const newImages = [...currentImages, ...res.data.images];
      
      setForm({ ...form, images: newImages });
      toast.success(`${res.data.images.length} image(s) uploaded successfully!`);
    } catch (error) {
      toast.error("Images upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  /* ======================
     SUBMIT PROFILE
  ====================== */
  const handleSubmit = async () => {
    if (overallProgress < 100) {
      return toast.error("Please complete all required sections");
    }

    try {
      let payload = { 
        ...form,
        skills: selectedSkills
      };

      const res = await axios.post(
        `${API}/complete`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Profile completed successfully!");
      login(res.data.user, token);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    }
  };

  /* ======================
     RENDER SECTION CONTENT
  ====================== */
  const renderSectionContent = () => {
    const role = user.role;

    if (role === "jobseeker") {
      // ... jobseeker sections remain the same
      switch (currentSection) {
        case "basicDetails":
          return (
            <div className="section-content">
              <h2 className="section-title">Basic Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName || ""}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile || ""}
                    onChange={handleChange}
                    placeholder="Enter your mobile number"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>City <span className="required">*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={form.city || ""}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          );

        case "resume":
          return (
            <div className="section-content">
              <div className="resume-header">
                <div className="resume-banner">
                  <div className="resume-icon">📄</div>
                  <h2>Create your Resume</h2>
                </div>
              </div>
              
              <div className="upload-section">
                <h3>Upload Resume <span className="required">*</span></h3>
                <div className="upload-area">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleResumeUpload(e.target.files[0])}
                    className="file-input"
                    id="resume-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="resume-upload" className="upload-label">
                    <div className="upload-icon">📎</div>
                    <span>{uploading ? "Uploading..." : "Choose File"}</span>
                  </label>
                </div>
                {form.resume && (
                  <div className="upload-success">
                    <span className="success-icon">✓</span>
                    <span>Resume uploaded successfully!</span>
                  </div>
                )}
              </div>
            </div>
          );

        case "about":
          return (
            <div className="section-content">
              <h2 className="section-title">About <span className="required">*</span></h2>
              <div className="form-group">
                <textarea
                  name="about"
                  value={form.about || ""}
                  onChange={handleChange}
                  placeholder="Tell us about yourself, your experience, and what makes you unique..."
                  className="form-textarea"
                  rows="8"
                />
              </div>
            </div>
          );

        case "skills":
          return (
            <div className="section-content">
              <h2 className="section-title">
                <span className="section-icon">✓</span> Skills
              </h2>
              
              <div className="skills-container">
                {selectedSkills.length > 0 && (
                  <div className="selected-skills">
                    {selectedSkills.map((skill, idx) => (
                      <div key={idx} className="skill-tag">
                        <span>{skill}</span>
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="remove-skill"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="suggestions-section">
                  <h3>Suggestions</h3>
                  <div className="skill-suggestions">
                    {skillSuggestions
                      .filter(s => !selectedSkills.includes(s))
                      .map((skill, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAddSkill(skill)}
                          className="suggestion-tag"
                        >
                          {skill}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Skills</label>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillInputKeyPress}
                    placeholder="List your skills here, showcasing what you excel at."
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          );

        case "education":
          return (
            <div className="section-content">
              <h2 className="section-title">Education <span className="required">*</span></h2>
              <div className="form-group">
                <label>Highest Education</label>
                <input
                  type="text"
                  name="education"
                  value={form.education || ""}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor's in Computer Science"
                  className="form-input"
                />
              </div>
            </div>
          );

        case "experience":
          return (
            <div className="section-content">
              <h2 className="section-title">Work Experience</h2>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={form.experience || ""}
                  onChange={handleChange}
                  placeholder="Enter years of experience"
                  className="form-input"
                />
              </div>
            </div>
          );

        case "accomplishments":
          return (
            <div className="section-content">
              <h2 className="section-title">Accomplishments & Initiatives</h2>
              <div className="form-group">
                <textarea
                  name="accomplishments"
                  value={form.accomplishments || ""}
                  onChange={handleChange}
                  placeholder="Share your key achievements, awards, certifications, or initiatives..."
                  className="form-textarea"
                  rows="6"
                />
              </div>
            </div>
          );

        default:
          return null;
      }
    } else if (role === "recruiter") {
      switch (currentSection) {
        case "basicDetails":
          return (
            <div className="section-content">
              <h2 className="section-title">Company Basics</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName || ""}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Company Website <span className="required">*</span></label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={form.companyWebsite || ""}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={form.contactNumber || ""}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          );

        case "companyDetails":
          return (
            <div className="section-content">
              <h2 className="section-title">Company Details</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Company Description <span className="required">*</span></label>
                  <textarea
                    name="companyDescription"
                    value={form.companyDescription || ""}
                    onChange={handleChange}
                    placeholder="Describe your company..."
                    className="form-textarea"
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Company Location <span className="required">*</span></label>
                  <input
                    type="text"
                    name="companyLocation"
                    value={form.companyLocation || ""}
                    onChange={handleChange}
                    placeholder="Enter location"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Industry Type <span className="required">*</span></label>
                  <input
                    type="text"
                    name="industryType"
                    value={form.industryType || ""}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Finance"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          );

        case "branding":
          return (
            <div className="section-content">
              <h2 className="section-title">Branding</h2>
              <div className="form-group">
                <label>Upload Company Logo <span className="required">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e.target.files[0])}
                  className="form-input"
                  disabled={uploading}
                />
                {form.companyLogo && (
                  <img
                    src={form.companyLogo}
                    alt="Company logo"
                    style={{ width: 120, marginTop: 10, borderRadius: 8 }}
                  />
                )}
              </div>
            </div>
          );

        default:
          return null;
      }
    } else if (role === "business") {
      switch (currentSection) {
        case "basicDetails":
          return (
            <div className="section-content">
              <h2 className="section-title">Business Info</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Business Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="businessName"
                    value={form.businessName || ""}
                    onChange={handleChange}
                    placeholder="Enter business name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Category <span className="required">*</span></label>
                  <input
                    type="text"
                    name="category"
                    value={form.category || ""}
                    onChange={handleChange}
                    placeholder="e.g., Restaurant, Retail"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Details <span className="required">*</span></label>
                  <input
                    type="text"
                    name="contactDetails"
                    value={form.contactDetails || ""}
                    onChange={handleChange}
                    placeholder="Enter contact details"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          );

        case "businessDetails":
          return (
            <div className="section-content">
              <h2 className="section-title">Business Details</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Address <span className="required">*</span></label>
                  <textarea
                    name="address"
                    value={form.address || ""}
                    onChange={handleChange}
                    placeholder="Enter business address"
                    className="form-textarea"
                    rows="3"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description <span className="required">*</span></label>
                  <textarea
                    name="description"
                    value={form.description || ""}
                    onChange={handleChange}
                    placeholder="Describe your business..."
                    className="form-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          );

        // ✅ FIXED: Business Media Section with Image Upload
        case "media":
          return (
            <div className="section-content">
              <div className="media-header">
                <div className="media-banner">
                  <div className="media-icon">📸</div>
                  <h2>Business Media</h2>
                </div>
              </div>
              
              <div className="upload-section">
                <h3>Upload Business Images <span className="required">*</span></h3>
                <p className="upload-hint">Upload up to 5 high-quality images of your business (Max 5MB each)</p>
                
                <div className="upload-area multiple">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleBusinessImagesUpload(e.target.files)}
                    className="file-input"
                    id="business-images-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="business-images-upload" className="upload-label">
                    <div className="upload-icon">📷</div>
                    <span>{uploading ? "Uploading..." : "Choose Images"}</span>
                  </label>
                </div>

                {form.images && form.images.length > 0 && (
                  <div className="images-preview">
                    <h4>Uploaded Images ({form.images.length}/5):</h4>
                    <div className="images-grid">
                      {form.images.map((imageUrl, idx) => (
                        <div key={idx} className="image-preview">
                          <img 
                            src={imageUrl} 
                            alt={`Business image ${idx + 1}`}
                            style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
                          />
                          <button
                            onClick={() => {
                              const newImages = form.images.filter((_, i) => i !== idx);
                              setForm({ ...form, images: newImages });
                            }}
                            className="remove-image"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );

        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Edit Profile
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="profile-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="sidebar-top">
            <div className="enhance-card">
              <h3>Enhance your Profile</h3>
              <p>Stay ahead of the competition by regularly updating your profile.</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {sections[user.role]?.map((section) => {
              const progress = getSectionProgress(section.id);
              const isComplete = progress === 100;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`nav-item ${currentSection === section.id ? "active" : ""} ${isComplete ? "complete" : ""}`}
                >
                  <span className="nav-icon">
                    {isComplete ? "✓" : section.icon}
                  </span>
                  <span className="nav-label">{section.label}</span>
                  {section.required && <span className="required-badge">Required</span>}
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Progress Indicator */}
          <div className="overall-progress">
            <div className="progress-info">
              <span>Overall Progress</span>
              <span className="progress-percent">{overallProgress}%</span>
            </div>
            <div className="overall-progress-bar">
              <div 
                className="overall-progress-fill" 
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-main">
          {renderSectionContent()}
          
          <div className="action-bar">
            <button 
              onClick={handleSubmit} 
              className="save-button"
              disabled={overallProgress < 100 || uploading}
            >
              <span className="save-icon">✓</span> 
              {uploading ? "Saving..." : "Save & Complete"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompleteProfile;
