const { check } = require('express-validator');

const createPaymentValidator = [
  check('invoice')
    .notEmpty()
    .withMessage('Invoice ID is required')
    .isMongoId()
    .withMessage('Invalid invoice ID'),
  check('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  check('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'check', 'transfer'])
    .withMessage('Payment method must be: cash, check, or transfer'),
  check('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  check('note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Note must be less than 500 characters'),
];

module.exports = { createPaymentValidator };
