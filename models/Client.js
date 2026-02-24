const mongoose = require('mongoose');
const { spawn } = require('node:child_process');

// Define the Client schema for managing company clients
const clientSchema = new mongoose.Schema(
  {
    // Client company name field
    name: {
      type: String,
      required: true, // Name is required
      trim: true, // Remove whitespace
      minlength: [2, 'Client name must be at least 2 characters long'], // Minimum name length
      maxlength: [100, 'Client name cannot be longer than 100 characters'], // Maximum name length
    },

    // Client email field
    email: {
      type: String,
      trim: true, // Remove whitespace
      lowercase: true, // Convert to lowercase
      unique: true, // Email must be unique in the database
    },

    // Client phone number field
    phone: {
      type: String,
      trim: true, // Remove whitespace
      maxlength: [20, 'Phone number cannot be longer than 20 characters'], // Maximum phone number length
      minlength: [7, 'Phone number must be at least 7 characters long'], // Minimum phone number length
    },

    // Client address field
    address: {
      type: String,
      trim: true, // Remove whitespace
    },

    // Reference to the user who created this client
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: true, // createdBy is required
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Client', clientSchema);
