const mongoose = require('mongoose');

// Define the Payment schema for recording manual payments against invoices
const paymentSchema = new mongoose.Schema(
  {
    // Reference to the invoice being paid
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice', // Reference to Invoice model
      required: [true, 'Invoice is required for a payment'], // Invoice is required
    },

    // Payment amount field
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'], // Amount is required
      min: [0.01, 'Payment must be greater than 0'], // Minimum payment amount
    },

    // Date when the payment was made
    paymentDate: {
      type: Date,
      default: Date.now, // Default to current date/time
    },

    // Payment method used field
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'transfer'], // Payment method can only be one of these values
      required: [true, 'Payment method is required'], // Payment method is required
    },

    // Optional note or additional information about the payment
    note: {
      type: String,
      trim: true, // Remove whitespace
      maxlength: [500, 'Note cannot be longer than 500 characters'], // Maximum note length
    },

    // Reference to the user who recorded this payment
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: true, // recordedBy is required
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
