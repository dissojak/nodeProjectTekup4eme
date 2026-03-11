const { check } = require('express-validator');

const createInvoiceValidator = [
  check('invoiceNumber')
    .notEmpty()
    .withMessage('Invoice number is required')
    .trim(),
  check('client')
    .notEmpty()
    .withMessage('Client ID is required')
    .isMongoId()
    .withMessage('Invalid client ID'),
  check('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  check('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
];

const updateInvoiceValidator = [
  check('invoiceNumber')
    .optional()
    .trim(),
  check('client')
    .optional()
    .isMongoId()
    .withMessage('Invalid client ID'),
  check('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  check('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  check('status')
    .optional()
    .isIn(['unpaid', 'partially_paid', 'paid', 'overdue'])
    .withMessage('Status must be: unpaid, partially_paid, paid, or overdue'),
];

module.exports = { createInvoiceValidator, updateInvoiceValidator };
