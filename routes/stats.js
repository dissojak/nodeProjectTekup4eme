const express = require('express');
const router = express.Router();
const {
  getOverview,
  getInvoiceStats,
  getAgentStats,
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Dashboard and analytics
 */

/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     summary: Get overview statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Overview stats (totals, amounts, status breakdown)
 */

/**
 * @swagger
 * /api/stats/invoices:
 *   get:
 *     summary: Get invoice statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Invoice stats (by status, overdue, monthly trends, payment methods)
 */

/**
 * @swagger
 * /api/stats/agents:
 *   get:
 *     summary: Get agent performance statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Agent stats (actions count, amounts collected)
 */

router.use(protect);
router.use(authorize('manager', 'admin'));

router.get('/overview', getOverview);
router.get('/invoices', getInvoiceStats);
router.get('/agents', getAgentStats);

module.exports = router;
