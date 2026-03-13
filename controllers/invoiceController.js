const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find()
    .populate('client', 'name email phone')
    .populate('createdBy', 'name email');

  res.json(invoices);
});

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('client', 'name email phone')
    .populate('createdBy', 'name email');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  res.json(invoice);
});

// @desc    Get invoices by client
// @route   GET /api/invoices/client/:clientId
// @access  Private
const getInvoicesByClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.clientId);

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  const invoices = await Invoice.find({ client: req.params.clientId })
    .populate('client', 'name email phone')
    .populate('createdBy', 'name email');

  res.json(invoices);
});

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { invoiceNumber, client, amount, dueDate } = req.body;
  const clientExists = await Client.findById(client);
  if (!clientExists) {
    res.status(404);
    throw new Error('Client not found');
  }

  const invoiceExists = await Invoice.findOne({ invoiceNumber });
  if (invoiceExists) {
    res.status(400);
    throw new Error('Invoice number already exists');
  }

  const invoice = await Invoice.create({
    invoiceNumber,
    client,
    amount,
    dueDate,
    createdBy: req.user._id,
  });

  res.status(201).json(invoice);
});

// @desc    Update an invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const { invoiceNumber, client, amount, dueDate, status } = req.body;

  if (invoiceNumber) invoice.invoiceNumber = invoiceNumber;
  if (client) invoice.client = client;
  if (amount !== undefined) invoice.amount = amount;
  if (dueDate) invoice.dueDate = dueDate;
  if (status) invoice.status = status;

  const updatedInvoice = await invoice.save();
  res.json(updatedInvoice);
});

// @desc    Delete an invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  await invoice.deleteOne();
  res.json({ message: 'Invoice deleted successfully' });
});

module.exports = {
  getInvoices,
  getInvoiceById,
  getInvoicesByClient,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
