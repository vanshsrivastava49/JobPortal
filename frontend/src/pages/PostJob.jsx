import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PostJob = () => {
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "Full Time",
    description: "",
    skills: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.location || !form.description) {
      return toast.error("Please fill required fields");
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/jobs",
        {
          ...form,
          skills: form.skills.split(",").map(s => s.trim())
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Job submitted for admin approval 🎉");

      setForm({
        title: "",
        company: "",
        location: "",
        salary: "",
        type: "Full Time",
        description: "",
        skills: ""
      });

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar title="Post a Job" />

      <div
        style={{
          maxWidth: 900,
          margin: "40px auto",
          padding: 30,
          borderRadius: 16,
          background: "white",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
        }}
      >
        <h2 style={{ marginBottom: 25 }}>
          Create New Job Listing
        </h2>

        <div className="form-grid" style={{ display: "grid", gap: 20 }}>

          {/* Job Title */}
          <div>
            <label>Job Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input"
              placeholder="Frontend Developer"
            />
          </div>

          {/* Company */}
          <div>
            <label>Company Name</label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              className="input"
              placeholder="Google, Amazon..."
            />
          </div>

          {/* Location */}
          <div>
            <label>Location *</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="input"
              placeholder="Bangalore / Remote"
            />
          </div>

          {/* Salary */}
          <div>
            <label>Salary</label>
            <input
              name="salary"
              value={form.salary}
              onChange={handleChange}
              className="input"
              placeholder="₹8–12 LPA"
            />
          </div>

          {/* Job Type */}
          <div>
            <label>Job Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="input"
            >
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Internship</option>
              <option>Contract</option>
              <option>Remote</option>
            </select>
          </div>

          {/* Skills */}
          <div>
            <label>Skills (comma separated)</label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              className="input"
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          {/* Description */}
          <div>
            <label>Job Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              className="input"
              placeholder="Describe responsibilities, requirements..."
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: 14,
              fontSize: 16,
              borderRadius: 10,
              marginTop: 10
            }}
          >
            {loading ? "Posting..." : "Post Job"}
          </button>
        </div>

        <p
          style={{
            marginTop: 20,
            color: "#6b7280",
            fontSize: 14
          }}
        >
          All jobs require admin approval before going live.
        </p>
      </div>
    </div>
  );
};

export default PostJob;
