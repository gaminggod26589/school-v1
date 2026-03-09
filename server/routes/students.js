// Student routes — view all students, get by ID
// Teachers and principal can view and update student records
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/students — list all students (teacher + principal only)
router.get('/', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const { classGrade, search } = req.query; // optional filters
        const filter = { role: 'student' };
        if (classGrade) filter.classGrade = classGrade;
        if (search) {
            filter.name = new RegExp(search, 'i');
        }

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

// GET /api/students/:id/books — get books borrowed by a student
router.get('/:id/books', protect, async (req, res) => {
    try {
        if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const Book = require('../models/Book');
        const books = await Book.find({ 'borrowedBy.student': req.params.id }).select('title author category coverImage borrowedBy');
        
        // Map the result to include specifically when this student borrowed it
        const borrowedDetails = books.map(book => {
            const borrowRecord = book.borrowedBy.find(b => b.student.toString() === req.params.id);
            return {
                _id: book._id,
                title: book.title,
                author: book.author,
                category: book.category,
                coverImage: book.coverImage,
                borrowedAt: borrowRecord ? borrowRecord.borrowedAt : null,
                dueDate: borrowRecord ? borrowRecord.dueDate : null,
            };
        });

        res.json(borrowedDetails);
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
