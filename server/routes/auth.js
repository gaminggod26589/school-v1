// Auth routes — register, login, get current user profile
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to generate a signed JWT token
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
// Creates a new user (admin use or seeding)
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
        body('role').isIn(['student', 'teacher', 'principal']).withMessage('Invalid role'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { name, email, password, role, classGrade } = req.body;

            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ message: 'Email already registered' });

            const user = await User.create({ name, email, password, role, classGrade });
            res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name, email, role, classGrade } });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            if (!user.isActive) return res.status(403).json({ message: 'Account disabled' });

            res.json({
                token: generateToken(user._id),
                user: { id: user._id, name: user.name, email: user.email, role: user.role, classGrade: user.classGrade },
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

// GET /api/auth/me — get currently logged-in user info
router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

module.exports = router;
