// User model — stores all users (students, teachers, principal)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        // Role determines what they can access
        role: { type: String, enum: ['student', 'teacher', 'principal'], default: 'student' },
        // Only relevant for students — which class they are in
        classGrade: { type: Number, enum: [8, 9, 10], default: null },
        // Photo URL (optional)
        photo: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Hash password before saving to database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash if password changed
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare entered password with stored hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
