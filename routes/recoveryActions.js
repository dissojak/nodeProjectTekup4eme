const express = require('express');
const router = express.Router();
const {
  getRecoveryActions,
  getRecoveryActionsByClient,
  getRecoveryActionsByInvoice,
  createRecoveryAction,
  updateRecoveryAction,
  deleteRecoveryAction,
} = require('../controllers/recoveryActionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createRecoveryActionValidator,
  updateRecoveryActionValidator,
} = require('../validators/recoveryActionValidator');

router.use(protect); 

router
  .route('/')
  .get(getRecoveryActions)
  .post(authorize('agent', 'manager'), createRecoveryActionValidator, createRecoveryAction);

router.get('/client/:clientId', getRecoveryActionsByClient);
router.get('/invoice/:invoiceId', getRecoveryActionsByInvoice);

router
  .route('/:id')
  .put(authorize('agent', 'manager'), updateRecoveryActionValidator, updateRecoveryAction)
  .delete(authorize('manager', 'admin'), deleteRecoveryAction);

module.exports = router;
