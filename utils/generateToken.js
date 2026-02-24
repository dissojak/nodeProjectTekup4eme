const jwt = require('jsonwebtoken');

// Utility function to generate JWT token and store it in httpOnly cookie
const generateToken = (res, userId) => {
  // Create a signed JWT token with user ID payload
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d', // Token expires in 30 days by default
  });

  // Set the token as an httpOnly cookie (secure, cannot be accessed by JavaScript)
  res.cookie('jwt', token, {
    httpOnly: true, // Cookie cannot be accessed by client-side JavaScript
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expires in 30 days (milliseconds)
  });

  return token;
};

module.exports = generateToken;
