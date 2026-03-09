// Library routes — students (class 8-10) can browse, borrow and return books
// Teachers can upload (with draft support); principal/VP can see all uploads
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, authorize } = require('../middleware/auth');

const isManagement = (user) =>
    user.role === 'principal' || user.subRoles?.includes('vice-principal');

// GET /api/library/mine — teacher's own book uploads (all statuses)
router.get('/mine', protect, authorize('teacher'), async (req, res) => {
    try {
        const books = await Book.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/library/admin — principal/VP: all book uploads across school
router.get('/admin', protect, async (req, res) => {
    try {
        if (!isManagement(req.user)) return res.status(403).json({ message: 'Access denied.' });
        const books = await Book.find({})
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/library — list books (students only see published)
router.get('/', protect, async (req, res) => {
    try {
        const { search, category, classGrade } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (classGrade) filter.classGrade = classGrade;
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { author: new RegExp(search, 'i') },
            ];
        }
        // Students only see published or old books (not drafts) for their class
        if (req.user.role === 'student') {
            filter.status = { $ne: 'draft' };
            filter.$and = [
                { $or: [{ classGrade: req.user.classGrade }, { classGrade: null }] }
            ];
        } else {
            // Teachers/principal see only published/old in the general library view
            filter.status = { $ne: 'draft' };
        }
        const books = await Book.find(filter).sort({ title: 1 });
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/library/borrow/:bookId — student borrows a book
router.post('/borrow/:bookId', protect, authorize('student', 'teacher', 'principal'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (book.available <= 0) return res.status(400).json({ message: 'No copies available' });

        const alreadyBorrowed = book.borrowedBy.some(
            (b) => b.student.toString() === req.user._id.toString()
        );
        if (alreadyBorrowed) return res.status(400).json({ message: 'You already have this book' });

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);
        book.borrowedBy.push({ student: req.user._id, borrowedAt: new Date(), dueDate });
        book.available -= 1;
        await book.save();
        res.json({ message: 'Book borrowed successfully', dueDate });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/library/return/:bookId — student returns a book
router.post('/return/:bookId', protect, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        const borrowIndex = book.borrowedBy.findIndex(
            (b) => b.student.toString() === req.user._id.toString()
        );
        if (borrowIndex === -1) return res.status(400).json({ message: 'You have not borrowed this book' });
        book.borrowedBy.splice(borrowIndex, 1);
        book.available += 1;
        await book.save();
        res.json({ message: 'Book returned successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/library — add a new book (teacher, principal), supports draft
router.post('/', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const { title, author, category, totalCopies, coverImage, pdfUrl, classGrade, status } = req.body;
        if (!title || !author) return res.status(400).json({ message: 'Title and author are required' });
        const book = await Book.create({
            title, author, category,
            totalCopies: totalCopies || 1,
            available: totalCopies || 1,
            coverImage, pdfUrl, classGrade,
            uploadedBy: req.user._id,
            status: status === 'draft' ? 'draft' : 'published',
        });
        res.status(201).json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/library/:id/publish — teacher publishes their own draft book
router.patch('/:id/publish', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (req.user.role === 'teacher' && book.uploadedBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        book.status = 'published';
        await book.save();
        res.json({ message: 'Book published.', book });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/library/:id — teacher edits their own book; principal/VP can edit any
router.put('/:id', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (req.user.role === 'teacher' && book.uploadedBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this book.' });
        }
        const { title, author, category, pdfUrl, classGrade, status } = req.body;
        if (title !== undefined) book.title = title;
        if (author !== undefined) book.author = author;
        if (category !== undefined) book.category = category;
        if (pdfUrl !== undefined) book.pdfUrl = pdfUrl;
        // classGrade: null = all classes; only principal/VP or owner teacher can change
        if (classGrade !== undefined) book.classGrade = classGrade === '' || classGrade === null ? null : Number(classGrade);
        // Only principal/VP can directly set status via this endpoint
        if (status !== undefined && isManagement(req.user)) book.status = status;
        await book.save();
        res.json({ message: 'Book updated.', book });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/library/:id/status — principal/VP toggles live ↔ draft
router.patch('/:id/status', protect, async (req, res) => {
    try {
        if (!isManagement(req.user)) return res.status(403).json({ message: 'Access denied.' });
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        book.status = book.status === 'published' ? 'draft' : 'published';
        await book.save();
        res.json({ message: `Book is now ${book.status}.`, book });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/library/:id — teacher deletes own; principal can delete any
router.delete('/:id', protect, authorize('teacher', 'principal'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (req.user.role === 'teacher' && book.uploadedBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this book.' });
        }
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
