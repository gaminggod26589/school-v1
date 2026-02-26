// Notices routes — manages notices, news, and events
// Public can read; only principal can create/edit/delete
const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/auth');

// GET /api/notices?category=notice|news|event — public
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const notices = await Notice.find(filter).sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/notices/:id — single notice
router.get('/:id', async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(notice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/notices — create (principal only)
router.post('/', protect, authorize('principal'), async (req, res) => {
    try {
        const { title, body, category, date, eventDate, imageUrl, isPinned } = req.body;
        if (!title || !body || !date) return res.status(400).json({ message: 'title, body, date required' });

        const notice = await Notice.create({
            title, body, category, date, eventDate, imageUrl, isPinned,
            postedBy: req.user._id,
        });
        res.status(201).json(notice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/notices/:id — update (principal only)
router.put('/:id', protect, authorize('principal'), async (req, res) => {
    try {
        const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(notice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/notices/:id — delete (principal only)
router.delete('/:id', protect, authorize('principal'), async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notice deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
