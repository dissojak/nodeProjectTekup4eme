const mongoose = require('mongoose');

// Define the Payment schema for recording manual payments and online gateway payments against invoices
const paymentSchema = new mongoose.Schema(
  {
    // Reference to the invoice being paid
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice', 
      required: [true, 'Invoice is required for a payment'],
    },

    // Payment amount field
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment must be greater than 0'],
    },

    // Date when the payment was made
    paymentDate: {
      type: Date,
      default: Date.now,
    },

    // Payment method used field (manual methods)
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'transfer', 'stripe', 'paypal'],
      required: [true, 'Payment method is required'],
    },

    // Optional note or additional information about the payment
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot be longer than 500 characters'],
    },

    // Reference to the user who recorded this payment
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ===== Payment Gateway Fields (for online payments) =====
    // Name of the payment gateway (stripe, paypal, etc.)
    gatewayName: {
      type: String,
      enum: ['stripe', 'paypal', null],
      default: null,
    },

    // Transaction ID from the payment gateway
    transactionId: {
      type: String,
      sparse: true, // Allow null values, but unique when non-null
      unique: true,
    },

    // Status of the transaction in the gateway
    transactionStatus: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'captured', 'refunded'],
      default: 'pending',
    },

    // Complete response from payment gateway (for audit trail)
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Customer email for gateway payments
    customerEmail: {
      type: String,
      trim: true,
    },

    // Is this payment refundable (typically yes for gateway payments, no for cash)
    refundable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
