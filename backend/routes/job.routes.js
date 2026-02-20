const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { 
  createJob, updateJob, takedownJob, getJobById,  // recruiter
  getBusinessPendingJobs, businessApproveJob, businessRejectJob,
  getMyJobs, getApprovedJobs, getPublicJobs, getPublicJobById  // ← ADD THIS
} = require('../controllers/job.controller');

// 🔥 PUBLIC ROUTES (NO AUTH) - TOP
router.get('/public', getPublicJobs);           // List
router.get('/public/:jobId', getPublicJobById); // ← NEW SINGLE JOB

// Authenticated list
router.get('/', getApprovedJobs);

// 🔥 RECRUITER SINGLE JOB (for edit)
router.get('/:jobId', auth, role('recruiter'), getJobById);

// Protected routes...
router.post('/', auth, role('recruiter'), createJob);
router.patch('/:jobId', auth, role('recruiter'), updateJob);
router.patch('/takedown/:jobId', auth, role('recruiter'), takedownJob);
router.get('/pending', auth, role('business'), getBusinessPendingJobs);
router.patch('/approve/:jobId', auth, role('business'), businessApproveJob);
router.patch('/reject/:jobId', auth, role('business'), businessRejectJob);
router.get('/my', auth, role('recruiter'), getMyJobs);

module.exports = router;
