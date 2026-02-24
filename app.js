const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing
app.use(cookieParser());

// ====== ROUTES WILL BE ADDED HERE IN LATER STEPS ======

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Recouvra+ API' });
});

module.exports = app;
