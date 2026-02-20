const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { 
  createJob, updateJob, takedownJob, getJobById,
  getBusinessPendingJobs, businessApproveJob, businessRejectJob,
  getMyJobs, getApprovedJobs, getPublicJobs, getPublicJobById,
  toggleJobStatus // ← NEW IMPORT
} = require('../controllers/job.controller');

// PUBLIC ROUTES (no auth)
router.get('/public', getPublicJobs);
router.get('/public/:jobId', getPublicJobById);

// Authenticated list
router.get('/', getApprovedJobs);

// ✅ Named routes BEFORE /:jobId
router.get('/pending', auth, role('business'), getBusinessPendingJobs);
router.get('/my', auth, role('recruiter'), getMyJobs);

// ✅ NEW TOGGLE ROUTE (before dynamic :jobId)
router.patch('/:jobId/toggle-status', auth, role('recruiter'), toggleJobStatus);

// ✅ Dynamic route AFTER named routes
router.get('/:jobId', auth, role('recruiter'), getJobById);

// Recruiter actions
router.post('/', auth, role('recruiter'), createJob);
router.patch('/:jobId', auth, role('recruiter'), updateJob);
router.patch('/takedown/:jobId', auth, role('recruiter'), takedownJob);

// Business actions
router.patch('/approve/:jobId', auth, role('business'), businessApproveJob);
router.patch('/reject/:jobId', auth, role('business'), businessRejectJob);

module.exports = router;
