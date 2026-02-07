import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PendingJobs = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/jobs/pending",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobs(res.data || []);
    } catch {
      toast.error("Failed to load jobs");
    }
  };

  const approve = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/jobs/approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Job Approved");
    fetchJobs();
  };

  const reject = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/jobs/reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Job Rejected");
    fetchJobs();
  };

  return (
    <div>
      <Navbar title="Pending Job Approvals" />

      <div className="container">
        <h2 style={{ marginBottom: 20 }}>Pending Jobs</h2>

        {jobs.length === 0 && <p>No pending jobs 🎉</p>}

        {jobs.map((job) => (
          <div key={job._id} className="card" style={{ marginBottom: 15 }}>
            <h3>{job.title}</h3>
            <p>{job.description}</p>

            <p>
              <b>Recruiter:</b> {job.recruiter?.name}  
              ({job.recruiter?.email})
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-primary"
                onClick={() => approve(job._id)}
              >
                Approve
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => reject(job._id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingJobs;
