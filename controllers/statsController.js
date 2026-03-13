const asyncHandler = require('express-async-handler');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const RecoveryAction = require('../models/RecoveryAction');
const User = require('../models/User');

// @desc    Get overview statistics
// @route   GET /api/stats/overview
// @access  Private
const getOverview = asyncHandler(async (req, res) => {
  const totalClients = await Client.countDocuments();
  const totalInvoices = await Invoice.countDocuments();
  const totalPayments = await Payment.countDocuments();
  const totalRecoveryActions = await RecoveryAction.countDocuments();

  const invoicesByStatus = await Invoice.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  const totalAmountDue = await Invoice.aggregate([
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const totalAmountPaid = await Invoice.aggregate([
    { $group: { _id: null, total: { $sum: '$amountPaid' } } },
  ]);

  res.json({
    totalClients,
    totalInvoices,
    totalPayments,
    totalRecoveryActions,
    invoicesByStatus,
    totalAmountDue: totalAmountDue[0]?.total || 0,
    totalAmountPaid: totalAmountPaid[0]?.total || 0,
    totalAmountRemaining:
      (totalAmountDue[0]?.total || 0) - (totalAmountPaid[0]?.total || 0),
  });
});

// @desc    Get invoice statistics
// @route   GET /api/stats/invoices
// @access  Private
const getInvoiceStats = asyncHandler(async (req, res) => {
  const byStatus = await Invoice.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalPaid: { $sum: '$amountPaid' },
      },
    },
  ]);

  const overdueInvoices = await Invoice.find({
    status: { $in: ['unpaid', 'partially_paid'] },
    dueDate: { $lt: new Date() },
  })
    .populate('client', 'name email')
    .sort({ dueDate: 1 });

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const invoicesPerMonth = await Invoice.aggregate([
    { $match: { createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const paymentMethodStats = await Payment.aggregate([
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  res.json({
    byStatus,
    overdueInvoices,
    overdueCount: overdueInvoices.length,
    invoicesPerMonth,
    paymentMethodStats,
  });
});

// @desc    Get agent performance statistics
// @route   GET /api/stats/agents
// @access  Private
const getAgentStats = asyncHandler(async (req, res) => {
  const actionsByAgent = await RecoveryAction.aggregate([
    {
      $group: {
        _id: '$performedBy',
        totalActions: { $sum: 1 },
        actionTypes: { $push: '$actionType' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'agent',
      },
    },
    { $unwind: '$agent' },
    {
      $project: {
        agentName: '$agent.name',
        agentEmail: '$agent.email',
        totalActions: 1,
        actionTypes: 1,
      },
    },
    { $sort: { totalActions: -1 } },
  ]);

  
  const paymentsByAgent = await Payment.aggregate([
    {
      $group: {
        _id: '$recordedBy',
        totalPaymentsRecorded: { $sum: 1 },
        totalAmountCollected: { $sum: '$amount' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'agent',
      },
    },
    { $unwind: '$agent' },
    {
      $project: {
        agentName: '$agent.name',
        agentEmail: '$agent.email',
        totalPaymentsRecorded: 1,
        totalAmountCollected: 1,
      },
    },
    { $sort: { totalAmountCollected: -1 } },
  ]);

  res.json({
    actionsByAgent,
    paymentsByAgent,
  });
});

module.exports = { getOverview, getInvoiceStats, getAgentStats };
