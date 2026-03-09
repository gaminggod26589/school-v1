// Entry point for the Express backend
// Connects to MongoDB, sets up middleware, and mounts all routes

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

// Allow requests from the Next.js frontend (localhost:3000)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Parse incoming JSON request bodies
app.use(express.json());

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Activity Logger ──────────────────────────────────────────────────────────
// Logs every authenticated request to MongoDB for principal audit view
const activityLogger = require('./middleware/activityLogger');
app.use(activityLogger);

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        console.log(`[REQ] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${Date.now() - start}ms`);
    });
    next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/library', require('./routes/library'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/upload', require('./routes/upload'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: "Martyrs' Memorial School API is running 🎓" }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// ─── Connect to MongoDB & Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        // Only listen if not running in a Vercel serverless environment
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
        }
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    });

// Explicitly export for Vercel serverless functions
module.exports = app;
