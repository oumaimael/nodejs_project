// JWT utility functions for authentication
const jwt = require('jsonwebtoken');

// Use environment variable or a default secret (change in production!)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRY = '7d'; // Token expires in 7 days

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object containing id, userName, and email
 * @returns {string} JWT token
 */
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            userName: user.userName,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token data or null if invalid
 */
function verifyToken(token) {
    try {
        if (!token) return null;
        
        // Remove "Bearer " prefix if present
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        
        return jwt.verify(cleanToken, JWT_SECRET);
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
function extractToken(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        return parts[1];
    }
    return null;
}

module.exports = {
    generateToken,
    verifyToken,
    extractToken
};
