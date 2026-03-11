const { check } = require('express-validator');

const createRecoveryActionValidator = [
  check('invoice')
    .notEmpty()
    .withMessage('Invoice ID is required')
    .isMongoId()
    .withMessage('Invalid invoice ID'),
  check('client')
    .notEmpty()
    .withMessage('Client ID is required')
    .isMongoId()
    .withMessage('Invalid client ID'),
  check('actionType')
    .notEmpty()
    .withMessage('Action type is required')
    .isIn(['phone_call', 'email', 'letter', 'visit', 'legal'])
    .withMessage('Action type must be: phone_call, email, letter, visit, or legal'),
  check('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Note must be less than 1000 characters'),
  check('result')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Result must be less than 500 characters'),
  check('actionDate')
    .optional()
    .isISO8601()
    .withMessage('Action date must be a valid date'),
];

const updateRecoveryActionValidator = [
  check('actionType')
    .optional()
    .isIn(['phone_call', 'email', 'letter', 'visit', 'legal'])
    .withMessage('Action type must be: phone_call, email, letter, visit, or legal'),
  check('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Note must be less than 1000 characters'),
  check('result')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Result must be less than 500 characters'),
  check('actionDate')
    .optional()
    .isISO8601()
    .withMessage('Action date must be a valid date'),
];

module.exports = { createRecoveryActionValidator, updateRecoveryActionValidator };
