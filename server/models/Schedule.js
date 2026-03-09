const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
    {
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        dayOfWeek: { type: String, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], required: true },
        period: { type: Number, required: true },
        subject: { type: String, required: true },
        classGrade: { type: Number, enum: [8, 9, 10], required: true },
        section: { type: String, enum: ['A', 'B', 'C'], required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
