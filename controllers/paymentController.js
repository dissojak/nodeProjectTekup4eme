const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { getPaymentStrategy } = require('../strategies/paymentStrategies');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('invoice', 'invoiceNumber amount status')
    .populate('recordedBy', 'name email');

  res.json(payments);
});

// @desc    Get payments by invoice ID
// @route   GET /api/payments/invoice/:invoiceId
// @access  Private
const getPaymentsByInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.invoiceId);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const payments = await Payment.find({ invoice: req.params.invoiceId })
    .populate('invoice', 'invoiceNumber amount status')
    .populate('recordedBy', 'name email');

  res.json(payments);
});

// @desc    Record a new payment
// @route   POST /api/payments
// @access  Private
const createPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { invoice: invoiceId, amount, paymentMethod, paymentDate, note } = req.body;

  // Find the invoice
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  // Check if invoice is already fully paid
  if (invoice.status === 'paid') {
    res.status(400);
    throw new Error('This invoice is already fully paid');
  }

  // Check if payment exceeds remaining balance
  const remainingBalance = invoice.amount - invoice.amountPaid;
  if (amount > remainingBalance) {
    res.status(400);
    throw new Error(
      `Payment amount (${amount}) exceeds remaining balance (${remainingBalance})`
    );
  }

  // Use Strategy pattern to process payment
  const strategy = getPaymentStrategy(paymentMethod);
  const processedPayment = strategy.process({
    amount,
    paymentMethod,
    note,
  });

  // Create payment record
  const payment = await Payment.create({
    invoice: invoiceId,
    amount: processedPayment.amount,
    paymentMethod: processedPayment.paymentMethod,
    paymentDate: paymentDate || Date.now(),
    note: processedPayment.note || note,
    recordedBy: req.user._id,
  });

  // Update invoice: add payment to amountPaid and update status
  invoice.amountPaid += amount;

  if (invoice.amountPaid >= invoice.amount) {
    invoice.status = 'paid';
  } else if (invoice.amountPaid > 0) {
    invoice.status = 'partially_paid';
  }

  await invoice.save();

  res.status(201).json({
    payment,
    invoiceStatus: invoice.status,
    remainingBalance: invoice.amount - invoice.amountPaid,
    confirmation: processedPayment.confirmation,
  });
});

module.exports = { getPayments, getPaymentsByInvoice, createPayment };
