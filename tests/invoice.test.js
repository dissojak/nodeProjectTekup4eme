const request = require('supertest');
const app = require('./setup');

jest.setTimeout(30000);

describe('Invoice Endpoints', () => {
  let agentCookies;
  let managerCookies;
  let adminCookies;
  let clientId;
  let invoiceId;

  beforeAll(async () => {
    // Register agent
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invoice Agent',
        email: 'invoiceagent@test.com',
        password: '123456',
        role: 'agent',
      });

    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invoiceagent@test.com',
        password: '123456',
      });
    agentCookies = agentLogin.headers['set-cookie'];

    // Register manager
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invoice Manager',
        email: 'invoicemanager@test.com',
        password: '123456',
        role: 'manager',
      });

    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invoicemanager@test.com',
        password: '123456',
      });
    managerCookies = managerLogin.headers['set-cookie'];

    // Register admin
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invoice Admin',
        email: 'invoiceadmin@test.com',
        password: '123456',
        role: 'admin',
      });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invoiceadmin@test.com',
        password: '123456',
      });
    adminCookies = adminLogin.headers['set-cookie'];

    const clientRes = await request(app)
      .post('/api/clients')
      .set('Cookie', agentCookies)
      .send({ name: 'Invoice Test Client' });

    clientId = clientRes.body._id;
  });

  describe('POST /api/invoices', () => {
    it('should create a new invoice as agent', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', agentCookies)
        .send({
          invoiceNumber: 'INV-TEST-001',
          client: clientId,
          amount: 1500,
          dueDate: '2026-06-01',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.invoiceNumber).toBe('INV-TEST-001');
      expect(res.body.amount).toBe(1500);
      expect(res.body.status).toBe('unpaid');
      expect(res.body.amountPaid).toBe(0);
      invoiceId = res.body._id;
    });

    it('should create invoice as manager', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', managerCookies)
        .send({
          invoiceNumber: 'INV-TEST-002',
          client: clientId,
          amount: 2000,
          dueDate: '2026-07-01',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.invoiceNumber).toBe('INV-TEST-002');
    });

    it('should not create invoice with duplicate number', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', agentCookies)
        .send({
          invoiceNumber: 'INV-TEST-001',
          client: clientId,
          amount: 500,
          dueDate: '2026-06-01',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should not create invoice without required fields', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', agentCookies)
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('should validate invoice amount is positive', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', agentCookies)
        .send({
          invoiceNumber: 'INV-TEST-INVALID',
          client: clientId,
          amount: -100,
          dueDate: '2026-06-01',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .send({
          invoiceNumber: 'INV-NO-AUTH',
          client: clientId,
          amount: 1000,
          dueDate: '2026-06-01',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/invoices', () => {
    it('should get all invoices', async () => {
      const res = await request(app)
        .get('/api/invoices')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/invoices');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should get invoice by ID', async () => {
      const res = await request(app)
        .get(`/api/invoices/${invoiceId}`)
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.invoiceNumber).toBe('INV-TEST-001');
    });

    it('should return 404 for non-existent invoice', async () => {
      const res = await request(app)
        .get('/api/invoices/507f1f77bcf86cd799439011')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/invoices/client/:clientId', () => {
    it('should get invoices by client', async () => {
      const res = await request(app)
        .get(`/api/invoices/client/${clientId}`)
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return empty array for client with no invoices', async () => {
      // Create another client
      const clientRes = await request(app)
        .post('/api/clients')
        .set('Cookie', agentCookies)
        .send({ name: 'Empty Client' });

      const res = await request(app)
        .get(`/api/invoices/client/${clientRes.body._id}`)
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('PUT /api/invoices/:id', () => {
    it('should update an invoice as agent', async () => {
      const res = await request(app)
        .put(`/api/invoices/${invoiceId}`)
        .set('Cookie', agentCookies)
        .send({ amount: 2000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.amount).toBe(2000);
    });

    it('should update an invoice as manager', async () => {
      const res = await request(app)
        .put(`/api/invoices/${invoiceId}`)
        .set('Cookie', managerCookies)
        .send({ dueDate: '2026-08-01' });

      expect(res.statusCode).toBe(200);
    });

    it('should not update with invalid status', async () => {
      const res = await request(app)
        .put(`/api/invoices/${invoiceId}`)
        .set('Cookie', agentCookies)
        .send({ status: 'invalid_status' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/invoices/:id', () => {
    let deleteInvoiceId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', agentCookies)
        .send({
          invoiceNumber: 'INV-TO-DELETE',
          client: clientId,
          amount: 1000,
          dueDate: '2026-06-01',
        });
      deleteInvoiceId = res.body._id;
    });

    it('should delete an invoice as manager', async () => {
      const res = await request(app)
        .delete(`/api/invoices/${deleteInvoiceId}`)
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Invoice deleted successfully');
    });

    it('should return 404 for non-existent invoice', async () => {
      const res = await request(app)
        .delete('/api/invoices/507f1f77bcf86cd799439011')
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Authorization enforcement', () => {
    it('should allow all authenticated users to read invoices', async () => {
      const agentRes = await request(app)
        .get('/api/invoices')
        .set('Cookie', agentCookies);

      const managerRes = await request(app)
        .get('/api/invoices')
        .set('Cookie', managerCookies);

      expect(agentRes.statusCode).toBe(200);
      expect(managerRes.statusCode).toBe(200);
    });

    it('should allow agent and manager to create invoices', async () => {
      const agentRes = await request(app)
        .post('/api/invoices')
        .set('Cookie', agentCookies)
        .send({
          invoiceNumber: 'INV-AGENT-TEST',
          client: clientId,
          amount: 500,
          dueDate: '2026-06-01',
        });

      const managerRes = await request(app)
        .post('/api/invoices')
        .set('Cookie', managerCookies)
        .send({
          invoiceNumber: 'INV-MANAGER-TEST',
          client: clientId,
          amount: 750,
          dueDate: '2026-07-01',
        });

      expect(agentRes.statusCode).toBe(201);
      expect(managerRes.statusCode).toBe(201);
    });
  });
});
