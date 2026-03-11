const request = require('supertest');
const app = require('./setup');

describe('Client Endpoints', () => {
  let cookies;
  let clientId;

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Client Tester',
        email: 'clienttester@test.com',
        password: '123456',
        role: 'manager',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'clienttester@test.com',
        password: '123456',
      });

    cookies = loginRes.headers['set-cookie'];
  });

  describe('POST /api/clients', () => {
    it('should create a new client', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Cookie', cookies)
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

    it('should not create client without name', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Cookie', cookies)
        .send({
          email: 'noname@test.com',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should not create client when not authenticated', async () => {
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
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/clients/:id', () => {
    it('should get a client by ID', async () => {
      const res = await request(app)
        .get(`/api/clients/${clientId}`)
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(clientId);
      expect(res.body.name).toBe('Test Company');
    });

    it('should return 404 for non-existent client', async () => {
      const res = await request(app)
        .get('/api/clients/507f1f77bcf86cd799439011')
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/clients/:id', () => {
    it('should update a client', async () => {
      const res = await request(app)
        .put(`/api/clients/${clientId}`)
        .set('Cookie', cookies)
        .send({ name: 'Updated Company' });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Company');
    });
  });

  describe('DELETE /api/clients/:id', () => {
    it('should delete a client', async () => {
      const res = await request(app)
        .delete(`/api/clients/${clientId}`)
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Client deleted successfully');
    });
  });
});
