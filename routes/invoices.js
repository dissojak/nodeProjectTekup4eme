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
