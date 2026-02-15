// ============================================================================
// Backend: Add this route to get all users (Admin only)
// ============================================================================

// Add to your routes file (e.g., admin.routes.js or user.routes.js)

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// ============================================================================
// GET /api/admin/users - Get all users (Admin only)
// ============================================================================
router.get('/admin/users', auth, role('admin'), async (req, res) => {
  try {
    const { role: roleFilter, status, search } = req.query;

    // Build query
    let query = {};

    // Filter by role
    if (roleFilter && ['jobseeker', 'recruiter', 'business', 'admin'].includes(roleFilter)) {
      query.role = roleFilter;
    }

    // Filter by profile completion status
    if (status === 'complete') {
      query.profileCompleted = true;
    } else if (status === 'incomplete') {
      query.profileCompleted = false;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch users
    const users = await User.find(query)
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })
      .limit(500); // Limit to prevent performance issues

    res.json(users);

  } catch (err) {
    console.error('GET ALL USERS ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// ============================================================================
// GET /api/admin/stats - Get platform statistics (Admin only)
// ============================================================================
router.get('/admin/stats', auth, role('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      jobseekerCount,
      recruiterCount,
      businessCount,
      approvedBusinessCount,
      pendingBusinessCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'business' }),
      User.countDocuments({ role: 'business', 'businessProfile.status': 'approved' }),
      User.countDocuments({ role: 'business', 'businessProfile.status': 'pending' })
    ]);

    // You can also fetch job stats if you have a Job model
    // const Job = require('../models/Job');
    // const liveJobsCount = await Job.countDocuments({ status: 'approved' });
    // const pendingJobsCount = await Job.countDocuments({ status: 'pending_business' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        jobseekers: jobseekerCount,
        recruiters: recruiterCount,
        businesses: businessCount,
        approvedBusinesses: approvedBusinessCount,
        pendingBusinesses: pendingBusinessCount,
        // liveJobs: liveJobsCount,
        // pendingJobs: pendingJobsCount
      }
    });

  } catch (err) {
    console.error('GET STATS ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// ============================================================================
// GET /api/admin/user/:id - Get single user details (Admin only)
// ============================================================================
router.get('/admin/user/:id', auth, role('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error('GET USER DETAILS ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details'
    });
  }
});

// ============================================================================
// PATCH /api/admin/user/:id/toggle-status - Toggle user active status
// ============================================================================
router.patch('/admin/user/:id/toggle-status', auth, role('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Toggle active status (you can add an 'isActive' field to User model)
    // user.isActive = !user.isActive;
    // await user.save();

    res.json({
      success: true,
      message: 'User status updated'
    });

  } catch (err) {
    console.error('TOGGLE USER STATUS ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

module.exports = router;

// ============================================================================
// Don't forget to register this router in your main app file (e.g., server.js)
// ============================================================================
// const adminRoutes = require('./routes/admin.routes');
// app.use('/api', adminRoutes);