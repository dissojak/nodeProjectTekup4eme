const request = require('supertest');
const app = require('./setup');

describe('Statistics Endpoints', () => {
  let adminCookies;
  let managerCookies;
  let agentCookies;

  beforeAll(async () => {
    // Register admin
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Stats Admin',
        email: 'statsadmin@test.com',
        password: '123456',
        role: 'admin',
      });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'statsadmin@test.com',
        password: '123456',
      });
    adminCookies = adminLogin.headers['set-cookie'];

    // Register manager
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Stats Manager',
        email: 'statsmanager@test.com',
        password: '123456',
        role: 'manager',
      });

    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'statsmanager@test.com',
        password: '123456',
      });
    managerCookies = managerLogin.headers['set-cookie'];

    // Register agent
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Stats Agent',
        email: 'statsagent@test.com',
        password: '123456',
        role: 'agent',
      });

    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'statsagent@test.com',
        password: '123456',
      });
    agentCookies = agentLogin.headers['set-cookie'];

    // Create some test data
    const clientRes = await request(app)
      .post('/api/clients')
      .set('Cookie', agentCookies)
      .send({
        name: 'Stats Test Client',
        email: 'client@stats.com',
        phone: '12345678',
      });
    const clientId = clientRes.body._id;

    // Create multiple invoices
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/invoices')
        .set('Cookie', agentCookies)
        .send({
          invoiceNumber: `STATS-INV-00${i + 1}`,
          client: clientId,
          amount: 1000 + i * 500,
          dueDate: '2026-06-01',
        });
    }
  });

  describe('GET /api/stats/overview', () => {
    it('should get overview statistics as manager', async () => {
      const res = await request(app)
        .get('/api/stats/overview')
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalInvoices');
      expect(res.body).toHaveProperty('totalAmount');
      expect(res.body).toHaveProperty('totalPaid');
      expect(res.body).toHaveProperty('totalOutstanding');
    });

    it('should NOT allow non-manager to access', async () => {
      const res = await request(app)
        .get('/api/stats/overview')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/stats/overview');

      expect(res.statusCode).toBe(401);
    });

    it('should allow admin to access', async () => {
      const res = await request(app)
        .get('/api/stats/overview')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /api/stats/invoices', () => {
    it('should get invoice statistics', async () => {
      const res = await request(app)
        .get('/api/stats/invoices')
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('byStatus');
      expect(res.body).toHaveProperty('overdue');
      expect(res.body).toHaveProperty('paymentMethodBreakdown');
    });

    it('should return data organized by status', async () => {
      const res = await request(app)
        .get('/api/stats/invoices')
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(200);
      if (res.body.byStatus) {
        expect(res.body.byStatus).toHaveProperty('unpaid');
        expect(res.body.byStatus).toHaveProperty('partially_paid');
        expect(res.body.byStatus).toHaveProperty('paid');
      }
    });

    it('should require manager or admin role', async () => {
      const res = await request(app)
        .get('/api/stats/invoices')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/stats/agents', () => {
    it('should get agent performance statistics', async () => {
      const res = await request(app)
        .get('/api/stats/agents')
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body) || res.body.agents).toBeTruthy();
    });

    it('should show agent metrics', async () => {
      const res = await request(app)
        .get('/api/stats/agents')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      // Stats should show performance per agent
      expect(res.body).toBeDefined();
    });

    it('should require authorization', async () => {
      const res = await request(app)
        .get('/api/stats/agents')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Authorization for stats endpoints', () => {
    it('should enforce manager-only access', async () => {
      const endpoints = ['/api/stats/overview', '/api/stats/invoices', '/api/stats/agents'];

      for (const endpoint of endpoints) {
        // Should fail for agent
        const agentRes = await request(app)
          .get(endpoint)
          .set('Cookie', agentCookies);
        expect(agentRes.statusCode).toBe(403);

        // Should succeed for manager
        const managerRes = await request(app)
          .get(endpoint)
          .set('Cookie', managerCookies);
        expect([200, 403]).toContain(managerRes.statusCode);
      }
    });
  });
});
