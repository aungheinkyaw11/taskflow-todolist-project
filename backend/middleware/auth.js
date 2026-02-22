// =====================================================
//  backend/middleware/auth.js
//
//  This is a "middleware" — it runs BEFORE your route
//  handlers to check if the user is logged in.
//
//  HOW IT WORKS:
//  1. Frontend sends a request with a token in the header:
//     Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
//
//  2. This middleware checks if the token is valid
//
//  3. If valid  → adds user info to req.user, continues
//     If invalid → returns 401 Unauthorized error
//
//  USAGE in routes:
//  router.get('/tasks', authMiddleware, getTasksHandler)
//                        ↑ this runs first!
// =====================================================

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get the Authorization header
    // It looks like: "Bearer eyJhbGciOiJIUzI1NiIs..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Please login.' });
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    // Verify the token using our secret key
    // If token is expired or tampered with, this will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add the decoded user info to the request object
    // Now any route handler can access req.user.id, req.user.email
    req.user = decoded;

    // Move on to the actual route handler
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Please login.' });
  }
};

module.exports = authMiddleware;