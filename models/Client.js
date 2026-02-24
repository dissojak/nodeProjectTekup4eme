const mongoose = require('mongoose');

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
    email: {
      type: String,
      trim: true, // Remove whitespace
      lowercase: true, // Convert to lowercase
      unique: true, // Email must be unique in the database
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
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
