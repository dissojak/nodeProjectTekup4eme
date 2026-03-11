const request = require('supertest');
const app = require('./setup');

jest.setTimeout(90000);

describe('Client Endpoints', () => {
  let agentCookies;
  let managerCookies;
  let clientId;

  beforeAll(async () => {
    // Register and login as agent
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Client Agent',
        email: 'clientagent@test.com',
        password: '123456',
        role: 'agent',
      });

    const agentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'clientagent@test.com',
        password: '123456',
      });
    agentCookies = agentLogin.headers['set-cookie'];

    // Register and login as manager
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Client Manager',
        email: 'clientmanager@test.com',
        password: '123456',
        role: 'manager',
      });

    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'clientmanager@test.com',
        password: '123456',
      });
    managerCookies = managerLogin.headers['set-cookie'];

    // Register and login as admin
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Client Admin',
        email: 'clientadmin@test.com',
        password: '123456',
        role: 'admin',
      });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'clientadmin@test.com',
        password: '123456',
      });
    adminCookies = adminLogin.headers['set-cookie'];
  }, 90000);

  describe('POST /api/clients', () => {
    it('should create a new client as agent', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Cookie', agentCookies)
        .send({
          name: 'Test Company',
          email: 'company@test.com',
          phone: '12345678',
          address: '123 Test Street',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Test Company');
      clientId = res.body._id;
    });

    it('should create a new client as manager', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Cookie', managerCookies)
        .send({
          name: 'Manager Company',
          email: 'manager@company.com',
          phone: '87654321',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Manager Company');
    });

    it('should not create client without name', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Cookie', agentCookies)
        .send({
          email: 'noname@test.com',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate name length', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Cookie', agentCookies)
        .send({
          name: 'A', // Too short
          email: 'short@test.com',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Cookie', agentCookies)
        .send({
          name: 'Valid Name',
          email: 'not-an-email',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate phone length', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Cookie', agentCookies)
        .send({
          name: 'Valid Name',
          phone: '123', // Too short
        });

      expect(res.statusCode).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/clients')
        .send({ name: 'No Auth Client' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/clients', () => {
    it('should get all clients', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/clients');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/clients/:id', () => {
    it('should get a client by ID', async () => {
      const res = await request(app)
        .get(`/api/clients/${clientId}`)
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(clientId);
      expect(res.body.name).toBe('Test Company');
    });

    it('should return 404 for non-existent client', async () => {
      const res = await request(app)
        .get('/api/clients/507f1f77bcf86cd799439011')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/clients/:id', () => {
    it('should update a client as agent', async () => {
      const res = await request(app)
        .put(`/api/clients/${clientId}`)
        .set('Cookie', agentCookies)
        .send({ name: 'Updated Company' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Company');
    });

    it('should update a client as manager', async () => {
      const res = await request(app)
        .put(`/api/clients/${clientId}`)
        .set('Cookie', managerCookies)
        .send({ phone: '99999999' });

      expect(res.statusCode).toBe(200);
      expect(res.body.phone).toBe('99999999');
    });

    it('should validate updated fields', async () => {
      const res = await request(app)
        .put(`/api/clients/${clientId}`)
        .set('Cookie', agentCookies)
        .send({
          name: 'A', // Too short
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/clients/:id', () => {
    let deleteClientId;

    beforeAll(async () => {
      // Create a client specifically for deletion testing
      const res = await request(app)
        .post('/api/clients')
        .set('Cookie', agentCookies)
        .send({
          name: 'Client To Delete',
          email: 'delete@test.com',
        });
      deleteClientId = res.body._id;
    });

    it('should delete a client as manager', async () => {
      const res = await request(app)
        .delete(`/api/clients/${deleteClientId}`)
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Client deleted successfully');
    });

    it('should return 404 for non-existent client', async () => {
      const res = await request(app)
        .delete('/api/clients/507f1f77bcf86cd799439011')
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Authorization enforcement', () => {
    it('should allow all authenticated users to read clients', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Cookie', agentCookies);

      expect(res.statusCode).toBe(200);
    });

    it('should allow agent and manager to create clients', async () => {
      const agentRes = await request(app)
        .post('/api/clients')
        .set('Cookie', agentCookies)
        .send({ name: 'Agent Test' });

      const managerRes = await request(app)
        .post('/api/clients')
        .set('Cookie', managerCookies)
        .send({ name: 'Manager Test' });

      expect(agentRes.statusCode).toBe(201);
      expect(managerRes.statusCode).toBe(201);
    });
  });
});
