const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { getFactory } = require('../strategies/paymentGateways');

/**
 * @desc    Initiate a payment via payment gateway (Stripe, PayPal, etc.)
 * @route   POST /api/payments/gateway/initiate
 * @access  Private
 * @body    { invoiceId, gatewayName: 'stripe'|'paypal', amount, customerEmail }
 */
const initiateGatewayPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { invoiceId, gatewayName, amount, customerEmail } = req.body;

  // Validate invoice
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  // Check if invoice is fully paid
  if (invoice.status === 'paid') {
    res.status(400);
    throw new Error('This invoice is already fully paid');
  }

  // Validate amount
  const remainingBalance = invoice.amount - invoice.amountPaid;
  if (amount > remainingBalance) {
    res.status(400);
    throw new Error(
      `Payment amount (${amount}) exceeds remaining balance (${remainingBalance})`
    );
  }

  // Get payment gateway from factory
  const factory = getFactory();
  let gateway;

  try {
    gateway = factory.getGateway(gatewayName);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }

  // Check if gateway is configured
  if (!gateway.isConfigured()) {
    res.status(503);
    throw new Error(`Payment gateway '${gatewayName}' is not properly configured`);
  }

  // Process payment through gateway
  const gatewayResponse = await gateway.processPayment({
    amount,
    currency: 'usd',
    customerEmail,
    description: `Payment for Invoice #${invoice.invoiceNumber}`,
    invoiceId: invoice._id.toString(),
  });

  if (!gatewayResponse.success) {
    res.status(400);
    throw new Error(`Payment processing failed: ${gatewayResponse.message}`);
  }

  // Create payment record with gateway details
  const payment = await Payment.create({
    invoice: invoiceId,
    amount,
    paymentMethod: gatewayName,
    gatewayName,
    transactionId: gatewayResponse.transactionId,
    transactionStatus: gatewayResponse.status || 'pending',
    gatewayResponse,
    customerEmail,
    recordedBy: req.user._id,
    refundable: true,
  });

  res.status(201).json({
    success: true,
    payment: payment.toObject(),
    gatewayResponse,
    message: 'Payment initiated successfully. Awaiting completion.',
  });
});

/**
 * @desc    Confirm/Complete a gateway payment
 * @route   POST /api/payments/gateway/confirm
 * @access  Private
 * @body    { paymentId, transactionId }
 */
const confirmGatewayPayment = asyncHandler(async (req, res) => {
  const { paymentId, transactionId } = req.body;

  const payment = await Payment.findById(paymentId).populate('invoice');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  // Get gateway to verify transaction
  const factory = getFactory();
  const gateway = factory.getGateway(payment.gatewayName);

  // Verify payment with gateway
  const verification = await gateway.verifyPayment(transactionId);

  if (!verification.success) {
    payment.transactionStatus = 'failed';
    await payment.save();
    res.status(400);
    throw new Error('Payment verification failed');
  }

  // Update payment record
  payment.transactionStatus = verification.status || 'succeeded';
  payment.gatewayResponse = verification;
  await payment.save();

  // Update invoice if payment confirmed
  if (verification.verified || verification.status === 'succeeded') {
    const invoice = payment.invoice;
    invoice.amountPaid += payment.amount;

    if (invoice.amountPaid >= invoice.amount) {
      invoice.status = 'paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'partially_paid';
    }

    await invoice.save();
  }

  res.status(200).json({
    success: true,
    payment,
    message: 'Payment confirmed successfully',
  });
});

/**
 * @desc    Refund a gateway payment
 * @route   POST /api/payments/gateway/refund
 * @access  Private
 * @body    { paymentId, amount? }
 */
const refundGatewayPayment = asyncHandler(async (req, res) => {
  const { paymentId, amount } = req.body;

  const payment = await Payment.findById(paymentId).populate('invoice');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  // Check if payment is refundable
  if (!payment.refundable) {
    res.status(400);
    throw new Error('This payment cannot be refunded');
  }

  // Check if payment is already refunded
  if (payment.transactionStatus === 'refunded') {
    res.status(400);
    throw new Error('This payment is already refunded');
  }

  // Get gateway to process refund
  const factory = getFactory();
  const gateway = factory.getGateway(payment.gatewayName);

  // Process refund
  const refundResult = await gateway.refundPayment(
    payment.transactionId,
    amount || payment.amount
  );

  if (!refundResult.success) {
    res.status(400);
    throw new Error(`Refund failed: ${refundResult.message}`);
  }

  // Update payment status
  payment.transactionStatus = 'refunded';
  payment.gatewayResponse = refundResult;
  await payment.save();

  // Update invoice
  const invoice = payment.invoice;
  const refundAmount = amount || payment.amount;
  invoice.amountPaid -= refundAmount;

  if (invoice.amountPaid <= 0) {
    invoice.status = 'unpaid';
    invoice.amountPaid = 0;
  } else if (invoice.amountPaid < invoice.amount) {
    invoice.status = 'partially_paid';
  }

  await invoice.save();

  res.status(200).json({
    success: true,
    payment,
    refundId: refundResult.transactionId,
    refundedAmount: refundAmount,
    message: 'Payment refunded successfully',
  });
});

/**
 * @desc    Get available payment gateways
 * @route   GET /api/payments/gateways
 * @access  Public
 */
const getAvailableGateways = asyncHandler(async (req, res) => {
  const factory = getFactory();
  const gateways = factory.getAvailableGateways();
  const status = factory.getStatus();

  res.json({
    available: gateways,
    status,
    manualMethods: ['cash', 'check', 'transfer'],
  });
});

/**
 * @desc    Get gateway status
 * @route   GET /api/payments/gateway-status
 * @access  Private (Admin only)
 */
const getGatewayStatus = asyncHandler(async (req, res) => {
  const factory = getFactory();
  const status = factory.getStatus();

  res.json({
    configured: status,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  initiateGatewayPayment,
  confirmGatewayPayment,
  refundGatewayPayment,
  getAvailableGateways,
  getGatewayStatus,
};
