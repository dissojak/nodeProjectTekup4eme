const express = require('express');
const router = express.Router();
const {
  getOverview,
  getInvoiceStats,
  getAgentStats,
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('manager', 'admin'));

router.get('/overview', getOverview);
router.get('/invoices', getInvoiceStats);
router.get('/agents', getAgentStats);

module.exports = router;
