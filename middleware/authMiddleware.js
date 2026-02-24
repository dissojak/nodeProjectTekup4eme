const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');

// Middleware to protect routes - verifies JWT token and attaches user to request (Chain of Responsibility pattern)
const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    throw new HttpError('Not authorized, no token', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      throw new HttpError('Not authorized, user not found', 401);
    }

    next();
  } catch (error) {
    // If token is invalid or expired, Console the error , then throw a 401 error to the client side
    console.error('Token verification failed:', error.message);
    throw new HttpError('Not authorized, token invalid', 401);
  }
});

// Middleware to authorize routes based on user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new HttpError('Not authorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new HttpError(
        `Role '${req.user.role}' is not authorized to access this resource`,
        403
      );
    }

    next();
  };
};

module.exports = { protect, authorize };
