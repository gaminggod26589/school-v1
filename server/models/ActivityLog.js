// ActivityLog model — every authenticated request is recorded here
// Principal can view this to see who accessed what and when
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String }, // denormalized for quick display
        userRole: { type: String },
        method: { type: String }, // GET, POST, PUT, DELETE
        route: { type: String }, // e.g., /api/library
        ip: { type: String },
        // Timestamp is automatic via createdAt
    },
    { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
