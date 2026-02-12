const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { 
  createJob, 
  getBusinessPendingJobs, 
  businessApproveJob, 
  businessRejectJob, 
  getMyJobs, 
  getApprovedJobs,
  getPublicJobs  // ✅ ADD THIS
} = require('../controllers/job.controller');

// ✅ RECRUITER POSTS JOB
router.post('/', auth, role('recruiter'), createJob);

// ✅ BUSINESS OWNER - PENDING JOBS
router.get('/pending', auth, role('business'), getBusinessPendingJobs);

// ✅ BUSINESS OWNER - APPROVE/REJECT
router.patch('/approve/:jobId', auth, role('business'), businessApproveJob);
router.patch('/reject/:jobId', auth, role('business'), businessRejectJob);

// ✅ RECRUITER - MY JOBS
router.get('/my', auth, role('recruiter'), getMyJobs);

// 🔥 FIXED: PUBLIC LIVE JOBS (NO AUTH REQUIRED)
router.get('/public', getPublicJobs);  // ✅ CORRECT ROUTE - NO AUTH
router.get('/', auth, getApprovedJobs);  // Authenticated users

module.exports = router;
