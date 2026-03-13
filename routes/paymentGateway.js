const express = require('express');
const router = express.Router();
const {
  initiateGatewayPayment,
  confirmGatewayPayment,
  refundGatewayPayment,
  getAvailableGateways,
  getGatewayStatus,
} = require('../controllers/paymentGatewayController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Payment Gateways
 *   description: Online payment gateway processing (Stripe, PayPal, etc.)
 */

/**
 * @swagger
 * /api/payments/gateways:
 *   get:
 *     summary: Get available payment gateways
 *     tags: [Payment Gateways]
 *     security: []
 *     responses:
 *       200:
 *         description: List of available payment gateways
 */

/**
 * @swagger
 * /api/payments/gateway/initiate:
 *   post:
 *     summary: Initiate a payment via payment gateway
 *     tags: [Payment Gateways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *               - gatewayName
 *               - amount
 *               - customerEmail
 *             properties:
 *               invoiceId:
 *                 type: string
 *               gatewayName:
 *                 type: string
 *                 enum: [stripe, paypal]
 *               amount:
 *                 type: number
 *               customerEmail:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment initiated successfully
 *       400:
 *         description: Invalid request or gateway error
 *       404:
 *         description: Invoice not found
 */

/**
 * @swagger
 * /api/payments/gateway/confirm:
 *   post:
 *     summary: Confirm a gateway payment
 *     tags: [Payment Gateways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *               - transactionId
 *             properties:
 *               paymentId:
 *                 type: string
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 *       400:
 *         description: Verification failed
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /api/payments/gateway/refund:
 *   post:
 *     summary: Refund a gateway payment
 *     tags: [Payment Gateways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Refund processed
 *       400:
 *         description: Refund failed
 */

/**
 * @swagger
 * /api/payments/gateway-status:
 *   get:
 *     summary: Get payment gateway configuration status (Admin)
 *     tags: [Payment Gateways]
 *     responses:
 *       200:
 *         description: Gateway status details
 */

// Public routes (no auth required)
router.get('/gateways', getAvailableGateways);

// Protected routes (auth required)
router.use(protect);

router.post('/gateway/initiate', authorize('agent', 'manager'), initiateGatewayPayment);
router.post('/gateway/confirm', authorize('agent', 'manager'), confirmGatewayPayment);
router.post('/gateway/refund', authorize('manager', 'admin'), refundGatewayPayment);
router.get('/gateway-status', authorize('admin'), getGatewayStatus);

module.exports = router;
