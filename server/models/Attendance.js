// Attendance model — track daily attendance for students
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // teacher
        date: { type: String, required: true }, // format: "YYYY-MM-DD"
        classGrade: { type: Number, required: true },
        status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
    },
    { timestamps: true }
);

// Prevent duplicate attendance for same student on same day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
