const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const { protect, authorize } = require('../middleware/auth');

// GET /api/schedule — get schedule (teacher gets own, principal can get any by query)
router.get('/', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'teacher') {
            filter.teacher = req.user._id;
        } else if (req.query.teacherId) {
            filter.teacher = req.query.teacherId;
        }
        const schedule = await Schedule.find(filter).populate('teacher', 'name').sort({ dayOfWeek: 1, period: 1 });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/schedule — add a class to schedule (principal only)
router.post('/', protect, authorize('principal'), async (req, res) => {
    try {
        const { teacher, dayOfWeek, period, subject, classGrade, section } = req.body;
        if (!teacher || !dayOfWeek || !period || !subject || !classGrade || !section) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const sch = await Schedule.create(req.body);
        res.status(201).json(sch);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/schedule/:id — remove a scheduled period
router.delete('/:id', protect, authorize('principal'), async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Schedule entry deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
