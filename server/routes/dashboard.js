// Dashboard route — returns summary stats for the principal dashboard
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Book = require('../models/Book');
const Notice = require('../models/Notice');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

// GET /api/dashboard — stats snapshot (principal only)
router.get('/', protect, authorize('principal'), async (req, res) => {
    try {
        const [totalStudents, totalTeachers, totalBooks, totalNotices, recentLogs] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'teacher' }),
            Book.countDocuments(),
            Notice.countDocuments(),
            ActivityLog.find().sort({ createdAt: -1 }).limit(10),
        ]);

        // Get today's attendance count
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = await Attendance.countDocuments({ date: today, status: 'present' });

        res.json({
            totalStudents,
            totalTeachers,
            totalBooks,
            totalNotices,
            todayAttendance,
            recentLogs,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
