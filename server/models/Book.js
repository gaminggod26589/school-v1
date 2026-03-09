// Book model — library catalog for student borrowing
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        author: { type: String, required: true, trim: true },
        category: { type: String, default: 'General' },
        totalCopies: { type: Number, default: 1 },
        available: { type: Number, default: 1 },
        coverImage: { type: String },
        pdfUrl: { type: String },
        classGrade: { type: Number },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        // Array of students who currently have the book
        borrowedBy: [
            {
                student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                borrowedAt: { type: Date, default: Date.now },
                dueDate: { type: Date }, // due in 14 days
            },
        ],
        coverImage: { type: String, default: '' },
        pdfUrl: { type: String, default: '' },
        classGrade: { type: Number, default: null }, // Null means available to all
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['draft', 'published'], default: 'published' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
