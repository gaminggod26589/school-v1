// Teacher routes — get all teachers, get single teacher
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/teachers — public list of teachers (for Faculty page)
router.get('/', async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' }).select('name email photo').sort({ name: 1 });
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/teachers/:id —  single teacher detail
router.get('/:id', protect, authorize('principal'), async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id).select('-password');
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/teachers/:id — update teacher (principal only)
router.put('/:id', protect, authorize('principal'), async (req, res) => {
    try {
        const { name, email, isActive } = req.body;
        const teacher = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, isActive },
            { new: true }
        ).select('-password');
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
