// Book model — library catalog for student borrowing
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        author: { type: String, required: true, trim: true },
        category: { type: String, default: 'General' }, // e.g., Science, Math, Fiction
        totalCopies: { type: Number, default: 1 },
        available: { type: Number, default: 1 }, // copies currently available
        // Array of students who currently have the book
        borrowedBy: [
            {
                student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                borrowedAt: { type: Date, default: Date.now },
                dueDate: { type: Date }, // due in 14 days
            },
        ],
        coverImage: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
