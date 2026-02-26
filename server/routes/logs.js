// Activity Logs routes — principal views all user activity
const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

// GET /api/logs — get all logs (principal only), with optional filters
router.get('/', protect, authorize('principal'), async (req, res) => {
    try {
        const { userRole, route, limit = 100 } = req.query;
        const filter = {};
        if (userRole) filter.userRole = userRole;
        if (route) filter.route = new RegExp(route, 'i');

        const logs = await ActivityLog.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/logs — clear all logs (principal only)
router.delete('/', protect, authorize('principal'), async (req, res) => {
    try {
        await ActivityLog.deleteMany({});
        res.json({ message: 'All logs cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
