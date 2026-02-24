const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');

// Middleware to protect routes - verifies JWT token and attaches user to request (Chain of Responsibility pattern)
const protect = asyncHandler(async (req, res, next) => {
  // Extract JWT token from httpOnly cookie
  let token = req.cookies.jwt;

  // If no token found, throw unauthorized error
  if (!token) {
    throw new HttpError('Not authorized, no token', 401);
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database and attach to request (exclude password)
    req.user = await User.findById(decoded.userId).select('-password');

    // If user not found in database, throw error
    if (!req.user) {
      throw new HttpError('Not authorized, user not found', 401);
    }

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // If token is invalid or expired, throw error
    console.error('Token verification failed:', error.message);
    throw new HttpError('Not authorized, token invalid', 401);
  }
});

// Middleware to authorize routes based on user role
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is attached to request (protect middleware must run first)
    if (!req.user) {
      throw new HttpError('Not authorized', 401);
    }

    // Check if user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      throw new HttpError(
        `Role '${req.user.role}' is not authorized to access this resource`,
        403
      );
    }

    // Continue to next middleware/route handler
    next();
  };
};

module.exports = { protect, authorize };
