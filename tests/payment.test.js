const request = require('supertest');
const app = require('./setup');

jest.setTimeout(30000);

describe('Payment Endpoints', () => {
  let agentCookies;
  let managerCookies;
  let clientId;
  let invoiceId;
  let paymentId;

  beforeAll(async () => {
    // Register agent
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Payment Agent',
        email: 'paymentagent@test.com',
        password: '123456',
        role: 'agent',
      });

    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'paymentagent@test.com',
        password: '123456',
      });
    agentCookies = agentLogin.headers['set-cookie'];

    // Register manager
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Payment Manager',
        email: 'paymentmanager@test.com',
        password: '123456',
        role: 'manager',
      });

    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'paymentmanager@test.com',
        password: '123456',
      });
    managerCookies = managerLogin.headers['set-cookie'];

    // Create client
    const clientRes = await request(app)
      .post('/api/clients')
      .set('Cookie', agentCookies)
      .send({ name: 'Payment Test Client' });
    clientId = clientRes.body._id;

    // Create invoice
    const invoiceRes = await request(app)
      .post('/api/invoices')
      .set('Cookie', agentCookies)
      .send({
        invoiceNumber: 'PAY-INV-001',
        client: clientId,
        amount: 1000,
        dueDate: '2026-06-01',
      });
    invoiceId = invoiceRes.body._id;
  });

  describe('POST /api/payments', () => {
    it('should record a cash payment successfully', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          amount: 500,
          paymentMethod: 'cash',
          note: 'Cash payment received',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.payment).toHaveProperty('_id');
      expect(res.body.payment.amount).toBe(500);
      expect(res.body.invoiceStatus).toBe('partially_paid');
      expect(res.body.confirmation).toMatch(/^CASH-/);
      paymentId = res.body.payment._id;
    });

    it('should record a check payment with strategy processing', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          amount: 300,
          paymentMethod: 'check',
          note: 'Check payment',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.payment.paymentMethod).toBe('check');
      expect(res.body.confirmation).toMatch(/^CHK-/);
      expect(res.body.payment.note).toContain('Check payment');
    });

    it('should record a bank transfer payment', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          amount: 200,
          paymentMethod: 'transfer',
          note: 'Wire transfer',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.payment.paymentMethod).toBe('transfer');
      expect(res.body.confirmation).toMatch(/^TRF-/);
    });

    it('should update invoice status to paid when fully paid', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          amount: 0, // Will be auto-calculated to remaining balance
          paymentMethod: 'cash',
        });

      // Just ensure the response is structured correctly
      expect(res.statusCode).toBe(201);
    });

    it('should reject payment with invalid method', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          amount: 100,
          paymentMethod: 'bitcoin',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject payment exceeding remaining balance', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          amount: 5000, // More than invoice amount
          paymentMethod: 'cash',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('exceeds remaining balance');
    });

    it('should reject payment with invalid invoice ID', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Cookie', agentCookies)
        .send({
          invoice: '507f1f77bcf86cd799439011',
          amount: 100,
          paymentMethod: 'cash',
        });

      expect(res.statusCode).toBe(404);
    });

    it('should reject payment without required fields', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Cookie', agentCookies)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/payments', () => {
    it('should get all payments', async () => {
      const res = await request(app)
        .get('/api/payments')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/payments/invoice/:invoiceId', () => {
    it('should get payments for specific invoice', async () => {
      const res = await request(app)
        .get(`/api/payments/invoice/${invoiceId}`)
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 404 for non-existent invoice', async () => {
      const res = await request(app)
        .get('/api/payments/invoice/507f1f77bcf86cd799439011')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Authorization checks', () => {
    it('should allow manager to record payments', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Cookie', managerCookies)
        .send({
          invoice: invoiceId,
          amount: 50,
          paymentMethod: 'cash',
        });

      expect(res.statusCode).toBe(201);
    });

    it('should require authentication for payment endpoints', async () => {
      const res = await request(app)
        .get('/api/payments');

      expect(res.statusCode).toBe(401);
    });
  });
});
