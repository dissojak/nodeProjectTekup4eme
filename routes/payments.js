const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPaymentsByInvoice,
  createPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createPaymentValidator } = require('../validators/paymentValidator');

router.use(protect); // All payment routes require authentication

router
  .route('/')
  .get(getPayments)
  .post(authorize('agent', 'manager'), createPaymentValidator, createPayment);

router.get('/invoice/:invoiceId', getPaymentsByInvoice);

module.exports = router;
