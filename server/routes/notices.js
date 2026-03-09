// Notices routes — manages notices, news, and events
// Public can read; principal and vice-principal can create/edit/delete
const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/auth');

// Middleware: allow principal or vice-principal
const allowManagement = (req, res, next) => {
    const { role, subRole } = req.user;
    if (role === 'principal' || subRole === 'vice-principal') return next();
    return res.status(403).json({ message: 'Access denied. Principal or Vice-Principal only.' });
};

// GET /api/notices?category=notice|news|event — public
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};
        const notices = await Notice.find(filter)
            .sort({ isPinned: -1, createdAt: -1 })
            .populate('postedBy', 'name role subRole');
        res.json(notices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/notices/:id — single notice
router.get('/:id', async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id).populate('postedBy', 'name role');
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(notice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/notices — create (principal or vice-principal)
router.post('/', protect, allowManagement, async (req, res) => {
    try {
        const { title, body, category, date, eventDate, imageUrl, isPinned } = req.body;
        if (!title || !body) return res.status(400).json({ message: 'title and body are required' });

        const notice = await Notice.create({
            title, body,
            category: category || 'notice',
            date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            eventDate: eventDate || null,
            imageUrl: imageUrl || '',
            isPinned: isPinned || false,
            postedBy: req.user._id,
        });
        res.status(201).json(notice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/notices/:id — update (principal or vice-principal)
router.put('/:id', protect, allowManagement, async (req, res) => {
    try {
        const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        res.json(notice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/notices/:id — delete (principal or vice-principal)
router.delete('/:id', protect, allowManagement, async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notice deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
