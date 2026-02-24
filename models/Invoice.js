const mongoose = require('mongoose');

// Define the Invoice schema for managing unpaid invoices
const invoiceSchema = new mongoose.Schema(
  {
    // Unique invoice number field
    invoiceNumber: {
      type: String,
      required: true, // Invoice number is required
      unique: true, // Invoice number must be unique
      trim: true, // Remove whitespace
    },

    // Reference to the client who owes this invoice
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client', // Reference to Client model
      required: [true, 'Client is required for an invoice'], // Client is required
    },

    // Total invoice amount field
    amount: {
      type: Number,
      required: [true, 'Amount is required'], // Amount is required
      min: [0, 'Amount cannot be negative'], // Amount must be positive
    },

    // Amount that has been paid so far
    amountPaid: {
      type: Number,
      default: 0, // Default to 0 (nothing paid yet)
      min: 0, // Cannot be negative
    },

    // Invoice due date field
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'], // Due date is required
    },

    // Invoice payment status field
    status: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'overdue'], // Status can only be one of these values
      default: 'unpaid', // Default status is unpaid
    },

    // Reference to the user who created this invoice
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

module.exports = mongoose.model('Invoice', invoiceSchema);
