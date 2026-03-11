const request = require('supertest');
const app = require('./setup');

describe('Invoice Endpoints', () => {
  let cookies;
  let clientId;
  let invoiceId;

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invoice Tester',
        email: 'invoicetester@test.com',
        password: '123456',
        role: 'manager',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invoicetester@test.com',
        password: '123456',
      });

    cookies = loginRes.headers['set-cookie'];

    const clientRes = await request(app)
      .post('/api/clients')
      .set('Cookie', cookies)
      .send({ name: 'Invoice Test Client' });

    clientId = clientRes.body._id;
  });

  describe('POST /api/invoices', () => {
    it('should create a new invoice', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', cookies)
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
      invoiceId = res.body._id;
    });

    it('should not create invoice with duplicate number', async () => {
      const res = await request(app)
        .post('/api/invoices')
        .set('Cookie', cookies)
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
        .set('Cookie', cookies)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/invoices', () => {
    it('should get all invoices', async () => {
      const res = await request(app)
        .get('/api/invoices')
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should get invoice by ID', async () => {
      const res = await request(app)
        .get(`/api/invoices/${invoiceId}`)
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.invoiceNumber).toBe('INV-TEST-001');
    });
  });

  describe('GET /api/invoices/client/:clientId', () => {
    it('should get invoices by client', async () => {
      const res = await request(app)
        .get(`/api/invoices/client/${clientId}`)
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/invoices/:id', () => {
    it('should update an invoice', async () => {
      const res = await request(app)
        .put(`/api/invoices/${invoiceId}`)
        .set('Cookie', cookies)
        .send({ amount: 2000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.amount).toBe(2000);
    });
  });

  describe('DELETE /api/invoices/:id', () => {
    it('should delete an invoice', async () => {
      const res = await request(app)
        .delete(`/api/invoices/${invoiceId}`)
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Invoice deleted successfully');
    });
  });
});
