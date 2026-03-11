const request = require('supertest');
const app = require('./setup');

jest.setTimeout(30000);

describe('Auth Endpoints', () => {
  let cookies;
  let adminId;

  describe('POST /api/auth/register', () => {
    it('should register a new user with default agent role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'testuser@test.com',
          password: '123456',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Test User');
      expect(res.body.email).toBe('testuser@test.com');
      expect(res.body.role).toBe('agent');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should register user with specific role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin@test.com',
          password: '123456',
          role: 'admin',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.role).toBe('admin');
      adminId = res.body._id;
    });

    it('should not register with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'testuser@test.com',
          password: '123456',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should not register without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('should not register with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: 'short@test.com',
          password: '123',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should not register with invalid name length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A', // Less than 3 characters
          email: 'short@test.com',
          password: '123456',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate role enum', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Role User',
          email: 'invalidrole@test.com',
          password: '123456',
          role: 'superuser',
        });

      expect(res.statusCode).toBe(400);
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid Email',
          email: 'not-an-email',
          password: '123456',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@test.com',
          password: '123456',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.email).toBe('testuser@test.com');

      // Save cookies for authenticated requests
      cookies = res.headers['set-cookie'];
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@test.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noone@test.com',
          password: '123456',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.email).toBe('testuser@test.com');
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });
});
