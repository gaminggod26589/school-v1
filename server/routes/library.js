// Library routes — students (class 8-10) can browse, borrow and return books
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, authorize } = require('../middleware/auth');

// GET /api/library — list all books (all authenticated users)
router.get('/', protect, async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { author: new RegExp(search, 'i') },
            ];
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

        // Check if this user already borrowed this book
        const alreadyBorrowed = book.borrowedBy.some(
            (b) => b.student.toString() === req.user._id.toString()
        );
        if (alreadyBorrowed) return res.status(400).json({ message: 'You already have this book' });

        // Due date = 14 days from today
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

// POST /api/library — add a new book (principal only)
router.post('/', protect, authorize('principal'), async (req, res) => {
    try {
        const { title, author, category, totalCopies, coverImage } = req.body;
        if (!title || !author) return res.status(400).json({ message: 'Title and author are required' });

        const book = await Book.create({
            title, author, category, totalCopies: totalCopies || 1,
            available: totalCopies || 1, coverImage,
        });
        res.status(201).json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/library/:id — remove a book (principal only)
router.delete('/:id', protect, authorize('principal'), async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
