// Notice model — used for notices, news, and events
const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        body: { type: String, required: true },
        // Categorize into notice, news, or event
        category: { type: String, enum: ['notice', 'news', 'event'], default: 'notice' },
        date: { type: String, required: true }, // display date e.g., "Feb 23, 2025"
        eventDate: { type: Date },  // only for events — the actual event date
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        imageUrl: { type: String, default: '' },
        isPinned: { type: Boolean, default: false }, // pinned notices show at top
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
