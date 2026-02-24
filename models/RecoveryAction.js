const mongoose = require('mongoose');

// Define the RecoveryAction schema for tracking debt collection/recovery actions
const recoveryActionSchema = new mongoose.Schema(
  {
    // Reference to the invoice being recovered
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice', // Reference to Invoice model
      required: [true, 'Invoice is required for a recovery action'], // Invoice is required
    },

    // Reference to the client being contacted
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client', // Reference to Client model
      required: [true, 'Client is required for a recovery action'], // Client is required
    },

    // Type of recovery action taken field
    actionType: {
      type: String,
      enum: ['phone_call', 'email', 'letter', 'visit', 'legal'], // Action type can only be one of these values
      required: [true, 'Action type is required'], // Action type is required
    },

    // Notes about the recovery action
    note: {
      type: String,
      trim: true, // Remove whitespace
      maxlength: [1000, 'Note cannot be longer than 1000 characters'], // Maximum note length
    },

    // Result or outcome of the recovery action
    result: {
      type: String,
      trim: true, // Remove whitespace
      maxlength: [500, 'Result cannot be longer than 500 characters'], // Maximum result length
    },

    // Date when the recovery action was performed
    actionDate: {
      type: Date,
      default: Date.now, // Default to current date/time
    },

    // Reference to the user who performed this recovery action
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: true, // performedBy is required
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('RecoveryAction', recoveryActionSchema);
