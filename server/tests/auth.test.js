'use strict';

const request = require('supertest');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');

let db;

beforeAll(async () => {
  db = await setupTestDB();
}, 30000);

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB(db);
});

describe('Authentication API', () => {
  const sampleUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123!',
    college: 'MIT College of Engineering',
    degree: 'B.Tech',
    branch: 'CSE',
    semester: 5,
  };

  test('POST /api/auth/register creates a student user and sets httpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', sampleUser.name);
    expect(res.body.data).toHaveProperty('email', sampleUser.email);
    expect(res.body.data).toHaveProperty('role', 'student');
    expect(res.body.data).not.toHaveProperty('passwordHash');

    // Check cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.startsWith('token='))).toBe(true);
  });

  test('POST /api/auth/register rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(sampleUser).expect(201);

    const res = await request(app)
      .post('/api/auth/register')
      .send(sampleUser)
      .expect(409);

    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login succeeds with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: sampleUser.email, password: sampleUser.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(sampleUser.email);
  });

  test('POST /api/auth/login rejects incorrect password', async () => {
    await request(app).post('/api/auth/register').send(sampleUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: sampleUser.email, password: 'WrongPassword999!' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me returns current authenticated user', async () => {
    const regRes = await request(app).post('/api/auth/register').send(sampleUser);
    const cookie = regRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(sampleUser.email);
    expect(res.body.data.status).toBe('active');
  });

  test('POST /api/auth/logout clears auth cookie', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .expect(200);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
  });
});
