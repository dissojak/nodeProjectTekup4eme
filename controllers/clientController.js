const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Client = require('../models/Client');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private (all roles)
const getClients = asyncHandler(async (req, res) => {
  const clients = await Client.find().populate('createdBy', 'name email');
  res.json(clients);
});

// @desc    Get single client by ID
// @route   GET /api/clients/:id
// @access  Private (all roles)
const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id).populate('createdBy', 'name email');

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  res.json(client);
});

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private (agent, manager)
const createClient = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { name, email, phone, address } = req.body;

  const client = await Client.create({
    name,
    email,
    phone,
    address,
    createdBy: req.user._id,
  });

  res.status(201).json(client);
});

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private (agent, manager)
const updateClient = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  const { name, email, phone, address } = req.body;

  client.name = name || client.name;
  client.email = email || client.email;
  client.phone = phone || client.phone;
  client.address = address || client.address;

  const updatedClient = await client.save();
  res.json(updatedClient);
});

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Private (manager, admin)
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  await client.deleteOne();
  res.json({ message: 'Client deleted successfully' });
});

module.exports = { getClients, getClientById, createClient, updateClient, deleteClient };
