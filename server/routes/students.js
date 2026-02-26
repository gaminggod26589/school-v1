// Student routes — view all students, get by ID
// Teachers and principal can view and update student records
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/students — list all students (teacher + principal only)
router.get('/', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const { classGrade } = req.query; // optional filter by class
        const filter = { role: 'student' };
        if (classGrade) filter.classGrade = classGrade;

        const students = await User.find(filter).select('-password').sort({ name: 1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/students/:id — single student details
router.get('/:id', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/students/:id — update student info (principal only)
router.put('/:id', protect, authorize('principal'), async (req, res) => {
    try {
        const { name, email, classGrade, isActive } = req.body;
        const student = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, classGrade, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
