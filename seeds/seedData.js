/**
 * Test Data Generators and Seeds
 * Create realistic test data for database operations
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const RecoveryAction = require('../models/RecoveryAction');

// User test data
const testUsers = [
  {
    name: 'Adem',
    email: 'adem@recouvra.tn',
    password: '123456',
    role: 'agent',
  },
  {
    name: 'Baha',
    email: 'baha@recouvra.tn',
    password: '123456',
    role: 'manager',
  },
  {
    name: 'Stoon Disso Tose',
    email: 'stoon@recouvra.tn',
    password: '123456',
    role: 'admin',
  },
];

// Client test data
const testClients = [
  {
    name: 'Société Générale Tunisie',
    email: 'contact@sgt.tn',
    phone: '+216 71 947 900',
    address: 'Avenue Habib Bourguiba, Tunis 1001, Tunisie',
  },
  {
    name: 'BIAT - Banque Internationale Arabe de Tunisie',
    email: 'info@biat.tn',
    phone: '+216 71 957 111',
    address: '63 Avenue Habib Bourguiba, Tunis 1001, Tunisie',
  },
  {
    name: 'Pharmacie Centrale Sfax',
    email: 'support@pharmasfax.tn',
    phone: '+216 74 245 600',
    address: 'Rue de la Gare, Sfax 3000, Tunisie',
  },
];

// Function to seed users
async function seedUsers() {
  try {
    await User.deleteMany({});
    const createdUsers = [];

    for (const userData of testUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }

    console.log(`Seeded ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error.message);
    throw error;
  }
}

// Function to seed clients
async function seedClients(createdUsers) {
  try {
    await Client.deleteMany({});
    const createdClients = [];

    for (let i = 0; i < testClients.length; i++) {
      const clientData = {
        ...testClients[i],
        createdBy: createdUsers[0]._id, // Created by first user
      };
      const client = await Client.create(clientData);
      createdClients.push(client);
    }

    console.log(`Seeded ${createdClients.length} clients`);
    return createdClients;
  } catch (error) {
    console.error('Error seeding clients:', error.message);
    throw error;
  }
}

// Function to seed invoices
async function seedInvoices(createdClients, createdUsers) {
  try {
    await Invoice.deleteMany({});
    const createdInvoices = [];
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const invoiceData = [
      {
        invoiceNumber: 'FAC-SGT-2024-001',
        client: createdClients[0]._id,
        amount: 12500,
        dueDate: sevenDaysFromNow,
        status: 'unpaid',
        createdBy: createdUsers[0]._id,
      },
      {
        invoiceNumber: 'FAC-BIAT-2024-001',
        client: createdClients[1]._id,
        amount: 8750,
        amountPaid: 3500,
        dueDate: thirtyDaysAgo,
        status: 'partially_paid',
        createdBy: createdUsers[1]._id,
      },
      {
        invoiceNumber: 'FAC-PHARMA-2024-001',
        client: createdClients[2]._id,
        amount: 5600,
        amountPaid: 5600,
        dueDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'paid',
        createdBy: createdUsers[0]._id,
      },
      {
        invoiceNumber: 'FAC-SGT-2024-002',
        client: createdClients[0]._id,
        amount: 9850,
        dueDate: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
        status: 'overdue',
        createdBy: createdUsers[1]._id,
      },
    ];

    for (const inv of invoiceData) {
      const invoice = await Invoice.create(inv);
      createdInvoices.push(invoice);
    }

    console.log(`Seeded ${createdInvoices.length} invoices`);
    return createdInvoices;
  } catch (error) {
    console.error('Error seeding invoices:', error.message);
    throw error;
  }
}

// Function to seed payments
async function seedPayments(createdInvoices, createdUsers) {
  try {
    await Payment.deleteMany({});
    const createdPayments = [];

    // Payment for FAC-BIAT-2024-001 (partially paid invoice)
    const payment1 = await Payment.create({
      invoice: createdInvoices[1]._id,
      amount: 3500,
      paymentMethod: 'transfer',
      paymentDate: new Date(),
      note: 'Virement bancaire partiel - BIAT',
      recordedBy: createdUsers[0]._id,
    });
    createdPayments.push(payment1);

    // Payment for FAC-PHARMA-2024-001 (full payment)
    const payment2 = await Payment.create({
      invoice: createdInvoices[2]._id,
      amount: 5600,
      paymentMethod: 'check',
      paymentDate: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
      note: 'Chèque numéro 456789 - Paiement complet',
      recordedBy: createdUsers[1]._id,
    });
    createdPayments.push(payment2);

    console.log(`Seeded ${createdPayments.length} payments`);
    return createdPayments;
  } catch (error) {
    console.error('Error seeding payments:', error.message);
    throw error;
  }
}

// Function to seed recovery actions
async function seedRecoveryActions(createdInvoices, createdUsers) {
  try {
    await RecoveryAction.deleteMany({});
    const createdActions = [];

    const actionsData = [
      {
        invoice: createdInvoices[0]._id,
        client: createdInvoices[0].client,
        actionType: 'email',
        note: 'Rappel de paiement envoyé à Société Générale Tunisie',
        result: 'Aucune réponse reçue',
        actionDate: new Date(),
        performedBy: createdUsers[0]._id,
      },
      {
        invoice: createdInvoices[3]._id,
        client: createdInvoices[3].client,
        actionType: 'phone_call',
        note: 'Appel téléphonique au sujet du paiement en retard',
        result: 'Le client a promis le paiement dans 48 heures',
        actionDate: new Date(),
        performedBy: createdUsers[1]._id,
      },
      {
        invoice: createdInvoices[3]._id,
        client: createdInvoices[3].client,
        actionType: 'letter',
        note: 'Mise en demeure formelle envoyée par courrier recommandé',
        result: 'En attente de réponse',
        actionDate: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
        performedBy: createdUsers[1]._id,
      },
    ];

    for (const action of actionsData) {
      const recovery = await RecoveryAction.create(action);
      createdActions.push(recovery);
    }

    console.log(`Seeded ${createdActions.length} recovery actions`);
    return createdActions;
  } catch (error) {
    console.error('Error seeding recovery actions:', error.message);
    throw error;
  }
}

// Master seed function
async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    const users = await seedUsers();
    const clients = await seedClients(users);
    const invoices = await seedInvoices(clients, users);
    const payments = await seedPayments(invoices, users);
    const actions = await seedRecoveryActions(invoices, users);

    console.log('\nDatabase seeded successfully!');
    console.log('\nTest Data Created:');
    console.log(`  Users: ${users.length}`);
    console.log(`  Clients: ${clients.length}`);
    console.log(`  Invoices: ${invoices.length}`);
    console.log(`  Payments: ${payments.length}`);
    console.log(`  Recovery Actions: ${actions.length}`);

    return { users, clients, invoices, payments, actions };
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

module.exports = {
  seedDatabase,
  seedUsers,
  seedClients,
  seedInvoices,
  seedPayments,
  seedRecoveryActions,
};
