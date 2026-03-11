const { check } = require('express-validator');

const createClientValidator = [
  check('name')
    .notEmpty()
    .withMessage('Client name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  check('phone')
    .optional()
    .isLength({ min: 8, max: 15 })
    .withMessage('Phone must be between 8 and 15 characters'),
  check('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
];

const updateClientValidator = [
  check('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  check('phone')
    .optional()
    .isLength({ min: 8, max: 15 })
    .withMessage('Phone must be between 8 and 15 characters'),
  check('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
];

module.exports = { createClientValidator, updateClientValidator };
