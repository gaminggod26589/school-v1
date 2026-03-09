const mongoose = require('mongoose');

const practicalVideoSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        url: { type: String, required: true }, // YouTube, Google Drive, MP4 link
        classGrade: { type: Number, enum: [8, 9, 10], required: true },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['draft', 'published'], default: 'published' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('PracticalVideo', practicalVideoSchema);
