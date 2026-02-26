// Activity Logger middleware — runs on every request
// If user is authenticated, saves a log entry to MongoDB
// The principal can view these logs in the admin dashboard

const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const activityLogger = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Only log authenticated requests
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('name role');

            if (user) {
                // Save log asynchronously (don't block the request)
                ActivityLog.create({
                    user: user._id,
                    userName: user.name,
                    userRole: user.role,
                    method: req.method,
                    route: req.originalUrl,
                    ip: req.ip || req.connection.remoteAddress,
                }).catch(() => { }); // Silently fail to not disrupt the request
            }
        }
    } catch (_) {
        // Ignore logging errors — they should never stop the actual request
    }

    next();
};

module.exports = activityLogger;
