const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createClientValidator, updateClientValidator } = require('../validators/clientValidator');

router.use(protect); // All client routes require authentication

router
  .route('/')
  .get(getClients)
  .post(authorize('agent', 'manager'), createClientValidator, createClient);

router
  .route('/:id')
  .get(getClientById)
  .put(authorize('agent', 'manager'), updateClientValidator, updateClient)
  .delete(authorize('manager', 'admin'), deleteClient);

module.exports = router;
