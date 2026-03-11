const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Recouvra+ API',
      version: '1.0.0',
      description: 'API de gestion du recouvrement - Debt Collection Management API',
      contact: {
        name: 'Adem & Baha',
      },
    },
    servers: [
      {
        url: 'http://localhost:5500',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Adem' },
            email: { type: 'string', example: 'adem@test.com' },
            role: { type: 'string', enum: ['agent', 'manager', 'admin'], example: 'agent' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Client: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Company ABC' },
            email: { type: 'string', example: 'contact@abc.com' },
            phone: { type: 'string', example: '12345678' },
            address: { type: 'string', example: '123 Main St' },
            createdBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            invoiceNumber: { type: 'string', example: 'INV-001' },
            client: { type: 'string' },
            amount: { type: 'number', example: 1500 },
            amountPaid: { type: 'number', example: 0 },
            dueDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['unpaid', 'partially_paid', 'paid', 'overdue'] },
            createdBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            invoice: { type: 'string' },
            amount: { type: 'number', example: 500 },
            paymentDate: { type: 'string', format: 'date-time' },
            paymentMethod: { type: 'string', enum: ['cash', 'check', 'transfer'] },
            note: { type: 'string' },
            recordedBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        RecoveryAction: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            invoice: { type: 'string' },
            client: { type: 'string' },
            actionType: { type: 'string', enum: ['phone_call', 'email', 'letter', 'visit', 'legal'] },
            note: { type: 'string' },
            result: { type: 'string' },
            actionDate: { type: 'string', format: 'date-time' },
            performedBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            stack: { type: 'string' },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
