const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  getInvoicesByClient,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createInvoiceValidator, updateInvoiceValidator } = require('../validators/invoiceValidator');

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management
 */

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: List of invoices
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceNumber
 *               - client
 *               - amount
 *               - dueDate
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *               client:
 *                 type: string
 *                 description: Client ID
 *               amount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Invoice created
 */

/**
 * @swagger
 * /api/invoices/client/{clientId}:
 *   get:
 *     summary: Get invoices by client
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of invoices for client
 */

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice data
 *       404:
 *         description: Invoice not found
 *   put:
 *     summary: Update an invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [unpaid, partially_paid, paid, overdue]
 *     responses:
 *       200:
 *         description: Invoice updated
 *   delete:
 *     summary: Delete an invoice
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice deleted
 */

router.use(protect); 

router
  .route('/')
  .get(getInvoices)
  .post(authorize('agent', 'manager'), createInvoiceValidator, createInvoice);

router.get('/client/:clientId', getInvoicesByClient);

router
  .route('/:id')
  .get(getInvoiceById)
  .put(authorize('agent', 'manager'), updateInvoiceValidator, updateInvoice)
  .delete(authorize('manager', 'admin'), deleteInvoice);

module.exports = router;
