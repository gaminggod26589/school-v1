// Auth middleware — verifies JWT and attaches user info to request
// Also exports a role-guard helper to restrict routes by role

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token from Authorization header
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if header exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user to the request (excluding password)
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return res.status(401).json({ message: 'User not found' });

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalid or expired' });
    }
};

// Role guard — use after protect middleware
// Example: router.get('/logs', protect, authorize('principal'), handler)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role: ${roles.join(' or ')}`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
