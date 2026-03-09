// Staff management routes — assign sub-roles and register/manage teachers
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');

// Principal-or-vice-principal middleware
const allowManagement = (req, res, next) => {
    const { role, subRoles } = req.user;
    if (role === 'principal' || (subRoles && subRoles.includes('vice-principal'))) return next();
    return res.status(403).json({ message: 'Access denied. Management only.' });
};

// Principal-only middleware
const principalOnly = (req, res, next) => {
    if (req.user.role === 'principal') return next();
    return res.status(403).json({ message: 'Only the principal can perform this action.' });
};

// GET /api/staff
router.get('/', protect, allowManagement, async (req, res) => {
    try {
        const staff = await User.find({ role: { $in: ['teacher', 'principal'] } })
            .select('-password')
            .sort({ name: 1 });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/staff/:id/role — update subRoles array and extra fields
router.put('/:id/role', protect, allowManagement, async (req, res) => {
    try {
        const { subRoles, department, classTutorOf } = req.body;
        const user = await User.findById(req.params.id);
        if (!user || user.role === 'student') return res.status(404).json({ message: 'Staff member not found' });
        if (user.role === 'principal') return res.status(403).json({ message: 'Cannot modify the principal account.' });

        // Vice-principal cannot assign the vice-principal role to others
        if (req.user.subRoles?.includes('vice-principal') && req.user.role !== 'principal') {
            const newRoles = Array.isArray(subRoles) ? subRoles : [];
            if (newRoles.includes('vice-principal')) {
                return res.status(403).json({ message: 'Vice-principal cannot assign the vice-principal role.' });
            }
        }

        user.subRoles = Array.isArray(subRoles) ? subRoles : [];
        if (department !== undefined) user.department = department;
        if (classTutorOf !== undefined) user.classTutorOf = classTutorOf;
        await user.save();
        res.json({ message: 'Roles updated.', user: { _id: user._id, name: user.name, subRoles: user.subRoles, department: user.department, classTutorOf: user.classTutorOf } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/staff/register — register a new teacher
router.post('/register', protect, allowManagement, async (req, res) => {
    try {
        const { name, email, password, subRoles, department, classTutorOf } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered.' });

        const user = await User.create({
            name, email, password,
            role: 'teacher',
            subRoles: Array.isArray(subRoles) ? subRoles : [],
            department: department || '',
            classTutorOf: classTutorOf || '',
        });
        res.status(201).json({ message: 'Teacher registered.', user: { _id: user._id, name: user.name, email: user.email, subRoles: user.subRoles } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/staff/:id — deactivate (principal only)
router.delete('/:id', protect, principalOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role === 'principal') return res.status(400).json({ message: 'Cannot delete this account.' });
        user.isActive = false;
        await user.save();
        res.json({ message: 'Staff member deactivated.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
