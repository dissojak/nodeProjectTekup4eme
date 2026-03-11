const request = require('supertest');
const app = require('./setup');

jest.setTimeout(90000);

describe('User Management Endpoints', () => {
  let adminCookies;
  let managerCookies;
  let userId;

  beforeAll(async () => {
    // Register admin
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@test.com',
        password: '123456',
        role: 'admin',
      });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: '123456',
      });
    adminCookies = adminLogin.headers['set-cookie'];

    // Register manager
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Manager User',
        email: 'manager@test.com',
        password: '123456',
        role: 'manager',
      });

    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@test.com',
        password: '123456',
      });
    managerCookies = managerLogin.headers['set-cookie'];

    // Register a test user
    const testUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User for Deletion',
        email: 'testdel@test.com',
        password: '123456',
        role: 'agent',
      });
    userId = testUserRes.body._id;
  }, 90000);

  describe('GET /api/users', () => {
    it('should get all users as admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should reject non-admin users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(403);
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/users');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID as admin', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(userId);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('email');
    });

    it('should allow manager to get user info', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(userId);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user as admin', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', adminCookies)
        .send({
          name: 'Updated User Name',
          role: 'manager',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated User Name');
      expect(res.body.role).toBe('manager');
    });

    it('should reject non-admin update attempts', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', managerCookies)
        .send({
          name: 'Unauthorized Update',
        });

      expect(res.statusCode).toBe(403);
    });

    it('should validate role enum', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', adminCookies)
        .send({
          role: 'superuser',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user as admin', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User deleted successfully');
    });

    it('should reject non-admin delete attempts', async () => {
      // Create another test user first
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Delete User 2',
          email: 'testdel2@test.com',
          password: '123456',
          role: 'agent',
        });

      const res = await request(app)
        .delete(`/api/users/${userRes.body._id}`)
        .set('Cookie', managerCookies);

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .delete('/api/users/507f1f77bcf86cd799439011')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Authorization hierarchy', () => {
    it('should correctly enforce role-based access control', async () => {
      // Admin should have access
      let res = await request(app)
        .get('/api/users')
        .set('Cookie', adminCookies);
      expect(res.statusCode).toBe(200);

      // Manager should NOT have access to list all users
      res = await request(app)
        .get('/api/users')
        .set('Cookie', managerCookies);
      expect(res.statusCode).toBe(403);
    });
  });
});
