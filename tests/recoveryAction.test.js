const request = require('supertest');
const app = require('./setup');

jest.setTimeout(30000);

describe('Recovery Action Endpoints', () => {
  let agentCookies;
  let managerCookies;
  let clientId;
  let invoiceId;
  let recoveryActionId;

  beforeAll(async () => {
    // Register agent
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Recovery Agent',
        email: 'recoveryagent@test.com',
        password: '123456',
        role: 'agent',
      });

    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'recoveryagent@test.com',
        password: '123456',
      });
    agentCookies = agentLogin.headers['set-cookie'];

    // Register manager
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Recovery Manager',
        email: 'recoverymanager@test.com',
        password: '123456',
        role: 'manager',
      });

    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'recoverymanager@test.com',
        password: '123456',
      });
    managerCookies = managerLogin.headers['set-cookie'];

    // Create client
    const clientRes = await request(app)
      .post('/api/clients')
      .set('Cookie', agentCookies)
      .send({ name: 'Recovery Test Client' });
    clientId = clientRes.body._id;

    // Create invoice
    const invoiceRes = await request(app)
      .post('/api/invoices')
      .set('Cookie', agentCookies)
      .send({
        invoiceNumber: 'REC-INV-001',
        client: clientId,
        amount: 2000,
        dueDate: '2026-01-01', // Past due for recovery actions
      });
    invoiceId = invoiceRes.body._id;
  });

  describe('POST /api/recovery-actions', () => {
    it('should create a phone call recovery action', async () => {
      const res = await request(app)
        .post('/api/recovery-actions')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          client: clientId,
          actionType: 'phone_call',
          note: 'Called customer, promised payment',
          result: 'promising',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.actionType).toBe('phone_call');
      expect(res.body.note).toBe('Called customer, promised payment');
      recoveryActionId = res.body._id;
    });

    it('should create an email recovery action', async () => {
      const res = await request(app)
        .post('/api/recovery-actions')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          client: clientId,
          actionType: 'email',
          note: 'Sent payment reminder email',
          result: 'sent',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.actionType).toBe('email');
    });

    it('should create a formal letter recovery action', async () => {
      const res = await request(app)
        .post('/api/recovery-actions')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          client: clientId,
          actionType: 'letter',
          note: 'Sent formal demand letter',
          result: 'sent',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.actionType).toBe('letter');
    });

    it('should create a visit recovery action', async () => {
      const res = await request(app)
        .post('/api/recovery-actions')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          client: clientId,
          actionType: 'visit',
          note: 'In-person visit to client location',
          result: 'no_contact',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.actionType).toBe('visit');
    });

    it('should create a legal recovery action', async () => {
      const res = await request(app)
        .post('/api/recovery-actions')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          client: clientId,
          actionType: 'legal',
          note: 'Referred to legal team',
          result: 'referred',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.actionType).toBe('legal');
    });

    it('should reject invalid action type', async () => {
      const res = await request(app)
        .post('/api/recovery-actions')
        .set('Cookie', agentCookies)
        .send({
          invoice: invoiceId,
          client: clientId,
          actionType: 'smoke_signal',
          note: 'Invalid action',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject without required fields', async () => {
      const res = await request(app)
        .post('/api/recovery-actions')
        .set('Cookie', agentCookies)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/recovery-actions', () => {
    it('should get all recovery actions', async () => {
      const res = await request(app)
        .get('/api/recovery-actions')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/recovery-actions/client/:clientId', () => {
    it('should get recovery actions by client', async () => {
      const res = await request(app)
        .get(`/api/recovery-actions/client/${clientId}`)
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/recovery-actions/invoice/:invoiceId', () => {
    it('should get recovery actions by invoice', async () => {
      const res = await request(app)
        .get(`/api/recovery-actions/invoice/${invoiceId}`)
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/recovery-actions/:id', () => {
    it('should update a recovery action', async () => {
      const res = await request(app)
        .put(`/api/recovery-actions/${recoveryActionId}`)
        .set('Cookie', agentCookies)
        .send({
          result: 'payment_received',
          note: 'Customer paid in full',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe('payment_received');
    });
  });

  describe('DELETE /api/recovery-actions/:id', () => {
    it('should delete a recovery action', async () => {
      const res = await request(app)
        .delete(`/api/recovery-actions/${recoveryActionId}`)
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Recovery action deleted successfully');
    });
  });

  describe('Authorization checks', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/recovery-actions');

      expect(res.statusCode).toBe(401);
    });
  });
});
