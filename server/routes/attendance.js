// Attendance routes — teachers mark attendance, everyone with access can view
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// POST /api/attendance — teacher marks attendance for a student
router.post('/', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const { studentId, date, classGrade, status } = req.body;
        if (!studentId || !date || !classGrade) {
            return res.status(400).json({ message: 'studentId, date, classGrade are required' });
        }

        // upsert: update if exists, create if not (prevents duplicate for same day)
        const record = await Attendance.findOneAndUpdate(
            { student: studentId, date },
            {
                student: studentId,
                markedBy: req.user._id,
                date,
                classGrade,
                status: status || 'present',
            },
            { upsert: true, new: true }
        );

        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/attendance?date=YYYY-MM-DD&classGrade=9
// Teacher can filter by date and class
router.get('/', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const { date, classGrade, studentId } = req.query;
        const filter = {};
        if (date) filter.date = date;
        if (classGrade) filter.classGrade = Number(classGrade);
        if (studentId) filter.student = studentId;

        const records = await Attendance.find(filter)
            .populate('student', 'name classGrade')
            .populate('markedBy', 'name')
            .sort({ date: -1 });

        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/attendance/my — student sees their own attendance
router.get('/my', protect, authorize('student'), async (req, res) => {
    try {
        const records = await Attendance.find({ student: req.user._id }).sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
