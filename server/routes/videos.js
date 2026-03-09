const express = require('express');
const router = express.Router();
const PracticalVideo = require('../models/PracticalVideo');
const { protect, authorize } = require('../middleware/auth');

// Helper: check if caller is management (principal or vice-principal)
const isManagement = (user) =>
    user.role === 'principal' || user.subRoles?.includes('vice-principal');

// GET /api/videos/mine — teacher's own uploads (all statuses)
router.get('/mine', protect, authorize('teacher'), async (req, res) => {
    try {
        const videos = await PracticalVideo.find({ uploadedBy: req.user._id })
            .sort({ createdAt: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/videos/admin — principal/VP: all teacher uploads across school
router.get('/admin', protect, async (req, res) => {
    try {
        if (!isManagement(req.user)) return res.status(403).json({ message: 'Access denied.' });
        const videos = await PracticalVideo.find({})
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/videos — student sees only published for their class; teacher/principal see published
router.get('/', protect, async (req, res) => {
    try {
        const filter = { status: 'published' };
        if (req.user.role === 'student') {
            filter.classGrade = req.user.classGrade;
        } else if (req.query.classGrade) {
            filter.classGrade = req.query.classGrade;
        }
        const videos = await PracticalVideo.find(filter)
            .populate('uploadedBy', 'name photo')
            .sort({ createdAt: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/videos — add a new practical video (teacher only), supports draft
router.post('/', protect, authorize('teacher'), async (req, res) => {
    try {
        const { title, description, url, classGrade, status } = req.body;
        if (!title || !url || !classGrade) {
            return res.status(400).json({ message: 'Title, URL and target class are required.' });
        }
        const video = await PracticalVideo.create({
            title,
            description: description || '',
            url,
            classGrade,
            uploadedBy: req.user._id,
            status: status === 'draft' ? 'draft' : 'published',
        });
        res.status(201).json(video);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/videos/:id/publish — teacher publishes their own draft
router.patch('/:id/publish', protect, authorize('teacher'), async (req, res) => {
    try {
        const video = await PracticalVideo.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        if (video.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        video.status = 'published';
        await video.save();
        res.json({ message: 'Video published.', video });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/videos/:id — teacher edits their own video details; principal/VP can edit any
router.put('/:id', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const video = await PracticalVideo.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        if (req.user.role === 'teacher' && video.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this video.' });
        }
        const { title, description, url, classGrade } = req.body;
        if (title !== undefined) video.title = title;
        if (description !== undefined) video.description = description;
        if (url !== undefined) video.url = url;
        if (classGrade !== undefined) video.classGrade = classGrade;
        await video.save();
        res.json({ message: 'Video updated.', video });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/videos/:id/status — principal/VP toggles live ↔ draft
router.patch('/:id/status', protect, async (req, res) => {
    try {
        if (!isManagement(req.user)) return res.status(403).json({ message: 'Access denied.' });
        const video = await PracticalVideo.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        video.status = video.status === 'published' ? 'draft' : 'published';
        await video.save();
        res.json({ message: `Video is now ${video.status}.`, video });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/videos/:id — teacher deletes their own upload; principal can delete any
router.delete('/:id', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const video = await PracticalVideo.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        if (req.user.role === 'teacher' && video.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this video' });
        }
        await video.deleteOne();
        res.json({ message: 'Video deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
