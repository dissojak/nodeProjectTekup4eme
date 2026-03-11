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

/**
 * @swagger
 * tags:
 *   name: Recovery Actions
 *   description: Debt recovery action tracking
 */

/**
 * @swagger
 * /api/recovery-actions:
 *   get:
 *     summary: Get all recovery actions
 *     tags: [Recovery Actions]
 *     responses:
 *       200:
 *         description: List of recovery actions
 *   post:
 *     summary: Create a new recovery action
 *     tags: [Recovery Actions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoice
 *               - client
 *               - actionType
 *             properties:
 *               invoice:
 *                 type: string
 *               client:
 *                 type: string
 *               actionType:
 *                 type: string
 *                 enum: [phone_call, email, letter, visit, legal]
 *               note:
 *                 type: string
 *               result:
 *                 type: string
 *               actionDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Recovery action created
 */

/**
 * @swagger
 * /api/recovery-actions/client/{clientId}:
 *   get:
 *     summary: Get recovery actions by client
 *     tags: [Recovery Actions]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recovery actions for client
 */

/**
 * @swagger
 * /api/recovery-actions/invoice/{invoiceId}:
 *   get:
 *     summary: Get recovery actions by invoice
 *     tags: [Recovery Actions]
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recovery actions for invoice
 */

/**
 * @swagger
 * /api/recovery-actions/{id}:
 *   put:
 *     summary: Update a recovery action
 *     tags: [Recovery Actions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recovery action updated
 *   delete:
 *     summary: Delete a recovery action
 *     tags: [Recovery Actions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recovery action deleted
 */

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
