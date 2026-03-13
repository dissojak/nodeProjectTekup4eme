const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const RecoveryAction = require('../models/RecoveryAction');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// @desc    Get all recovery actions
// @route   GET /api/recovery-actions
// @access  Private
const getRecoveryActions = asyncHandler(async (req, res) => {
  const actions = await RecoveryAction.find()
    .populate('invoice', 'invoiceNumber amount status')
    .populate('client', 'name email phone')
    .populate('performedBy', 'name email');

  res.json(actions);
});

// @desc    Get recovery actions by client
// @route   GET /api/recovery-actions/client/:clientId
// @access  Private
const getRecoveryActionsByClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.clientId);

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  const actions = await RecoveryAction.find({ client: req.params.clientId })
    .populate('invoice', 'invoiceNumber amount status')
    .populate('client', 'name email phone')
    .populate('performedBy', 'name email');

  res.json(actions);
});

// @desc    Get recovery actions by invoice
// @route   GET /api/recovery-actions/invoice/:invoiceId
// @access  Private
const getRecoveryActionsByInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.invoiceId);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const actions = await RecoveryAction.find({ invoice: req.params.invoiceId })
    .populate('invoice', 'invoiceNumber amount status')
    .populate('client', 'name email phone')
    .populate('performedBy', 'name email');

  res.json(actions);
});

// @desc    Create a new recovery action
// @route   POST /api/recovery-actions
// @access  Private
const createRecoveryAction = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { invoice, client, actionType, note, result, actionDate } = req.body;

  const invoiceExists = await Invoice.findById(invoice);
  if (!invoiceExists) {
    res.status(404);
    throw new Error('Invoice not found');
  }


  const clientExists = await Client.findById(client);
  if (!clientExists) {
    res.status(404);
    throw new Error('Client not found');
  }

  const action = await RecoveryAction.create({
    invoice,
    client,
    actionType,
    note,
    result,
    actionDate: actionDate || Date.now(),
    performedBy: req.user._id,
  });

  res.status(201).json(action);
});

// @desc    Update a recovery action
// @route   PUT /api/recovery-actions/:id
// @access  Private
const updateRecoveryAction = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const action = await RecoveryAction.findById(req.params.id);

  if (!action) {
    res.status(404);
    throw new Error('Recovery action not found');
  }

  const { actionType, note, result, actionDate } = req.body;

  if (actionType) action.actionType = actionType;
  if (note !== undefined) action.note = note;
  if (result !== undefined) action.result = result;
  if (actionDate) action.actionDate = actionDate;

  const updatedAction = await action.save();
  res.json(updatedAction);
});

// @desc    Delete a recovery action
// @route   DELETE /api/recovery-actions/:id
// @access  Private
const deleteRecoveryAction = asyncHandler(async (req, res) => {
  const action = await RecoveryAction.findById(req.params.id);

  if (!action) {
    res.status(404);
    throw new Error('Recovery action not found');
  }

  await action.deleteOne();
  res.json({ message: 'Recovery action deleted successfully' });
});

module.exports = {
  getRecoveryActions,
  getRecoveryActionsByClient,
  getRecoveryActionsByInvoice,
  createRecoveryAction,
  updateRecoveryAction,
  deleteRecoveryAction,
};
