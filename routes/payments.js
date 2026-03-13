const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPaymentsByInvoice,
  createPayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createPaymentValidator } = require('../validators/paymentValidator');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment recording and tracking
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of payments
 *   post:
 *     summary: Record a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoice
 *               - amount
 *               - paymentMethod
 *             properties:
 *               invoice:
 *                 type: string
 *                 description: Invoice ID
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, check, transfer]
 *               note:
 *                 type: string
 *                 description: Optional note about the payment
 *               paymentDate:
 *                 type: string
 *                 format: date-time
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment recorded, invoice status updated
 */

/**
 * @swagger
 * /api/payments/invoice/{invoiceId}:
 *   get:
 *     summary: Get payments by invoice
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of payments for invoice
 */

router.use(protect); // All payment routes require authentication

router
  .route('/')
  .get(getPayments)
  .post(authorize('agent', 'manager'), createPaymentValidator, createPayment);

router.get('/invoice/:invoiceId', getPaymentsByInvoice);

module.exports = router;
