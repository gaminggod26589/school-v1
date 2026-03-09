const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/auth');

// GET /api/leave — list leave applications (teacher sees own, principal sees all)
router.get('/', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const filter = req.user.role === 'teacher' ? { teacher: req.user._id } : {};
        const leaves = await Leave.find(filter).populate('teacher', 'name email').sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/leave — apply for leave (teacher only)
router.post('/', protect, authorize('teacher'), async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        if (!startDate || !endDate || !reason) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }
        const leave = await Leave.create({
            teacher: req.user._id,
            startDate,
            endDate,
            reason,
        });
        res.status(201).json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/leave/:id — update leave status (principal only)
router.put('/:id', protect, authorize('principal'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        res.json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
