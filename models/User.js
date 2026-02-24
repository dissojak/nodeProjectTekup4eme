const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema for authentication and authorization
const userSchema = new mongoose.Schema(
  {
    // User full name field
    name: {
      type: String,
      required: true, // Name is required
      trim: true, // Remove leading/trailing whitespace
      minlength: [3, 'Name must be at least 3 characters long'], // Minimum length validation
      maxlength: [50, 'Name cannot be longer than 50 characters'], // Maximum length validation
    },

    // User email field
    email: {
      type: String,
      required: true, // Email is required
      unique: true, // Email must be unique in the database
      trim: true, // Remove whitespace
      lowercase: true, // Convert to lowercase
    },

    // User password field (hashed)
    password: {
      type: String,
      required: true, // Password is required
      minlength: [6, 'Password must be at least 6 characters long'], // Minimum password length
      select: false, // Don't return password by default in queries
    },

    // User role field
    role: {
      type: String,
      enum: ['agent', 'manager', 'admin'], // Role can only be one of these values
      default: 'agent', // Default role is 'agent'
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Pre-save hook to hash password before saving (Decorator pattern)
userSchema.pre('save', async function (next) {
  // If password is not modified, skip hashing
  if (!this.isModified('password')) return next();

  try {
    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10); // Salt rounds
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
