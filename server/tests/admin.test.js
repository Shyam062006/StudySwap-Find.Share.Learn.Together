'use strict';

const request = require('supertest');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');

let db;
let adminCookie;
let studentCookie;
let studentId;

beforeAll(async () => {
  db = await setupTestDB();
}, 30000);

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB(db);

  // Create admin
  const hash = await bcrypt.hash('AdminSecret123!', 10);
  await db.collection('users').insertOne({
    name: 'Super Admin',
    email: 'superadmin@studyswap.dev',
    passwordHash: hash,
    role: 'admin',
    college: 'Administration',
    degree: 'N/A',
    branch: 'N/A',
    semester: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'superadmin@studyswap.dev', password: 'AdminSecret123!' });
  adminCookie = adminLogin.headers['set-cookie'];

  // Create student
  const studentReg = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Dave Student',
      email: 'dave@student.com',
      password: 'StudentPass123!',
      college: 'Delhi Tech',
      degree: 'B.Tech',
      branch: 'IT',
      semester: 2,
    });
  studentCookie = studentReg.headers['set-cookie'];
  studentId = studentReg.body.data._id;
});

describe('Admin API', () => {
  test('Non-admins cannot access admin endpoints', async () => {
    // Unauthenticated request
    await request(app).get('/api/admin/stats').expect(401);

    // Student request
    await request(app)
      .get('/api/admin/stats')
      .set('Cookie', studentCookie)
      .expect(403);
  });

  test('GET /api/admin/stats returns platform counts', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Cookie', adminCookie)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalResources');
    expect(res.body.data).toHaveProperty('pendingResources');
    expect(res.body.data).toHaveProperty('publishedResources');
    expect(res.body.data).toHaveProperty('openReports');
    expect(res.body.data).toHaveProperty('totalDownloads');
    expect(res.body.data.totalUsers).toBe(2);
  });

  test('PATCH /api/admin/resources/:id/moderation can reject a resource with reason', async () => {
    const resourceDoc = await db.collection('resources').insertOne({
      title: 'Inappropriate Content Sample',
      description: 'This violates study policies.',
      college: 'Delhi Tech',
      degree: 'B.Tech',
      branch: 'IT',
      semester: 2,
      subject: 'Maths',
      resourceType: 'notes',
      tags: [],
      storedFilename: 'bad.pdf',
      storagePath: 'uploads/bad.pdf',
      mimeType: 'application/pdf',
      fileSize: 500,
      uploaderId: new ObjectId(studentId),
      moderationStatus: 'pending',
      downloadCount: 0,
      averageRating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const resId = resourceDoc.insertedId.toString();

    const rejectRes = await request(app)
      .patch(`/api/admin/resources/${resId}/moderation`)
      .set('Cookie', adminCookie)
      .send({ status: 'rejected', reason: 'Does not meet academic guidelines.' })
      .expect(200);

    expect(rejectRes.body.success).toBe(true);
    expect(rejectRes.body.data.status).toBe('rejected');

    // Verify rejection notification was created for student
    const notif = await db.collection('notifications').findOne({ recipientId: new ObjectId(studentId) });
    expect(notif).toBeDefined();
    expect(notif.type).toBe('resource_rejected');
  });

  test('PATCH /api/admin/users/:id/status can restrict and restore student accounts', async () => {
    // Restrict student
    const restrictRes = await request(app)
      .patch(`/api/admin/users/${studentId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'restricted' })
      .expect(200);

    expect(restrictRes.body.success).toBe(true);
    expect(restrictRes.body.data.status).toBe('restricted');

    // Restricted student cannot log in
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'dave@student.com', password: 'StudentPass123!' })
      .expect(401);

    // Restore student
    const restoreRes = await request(app)
      .patch(`/api/admin/users/${studentId}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'active' })
      .expect(200);

    expect(restoreRes.body.data.status).toBe('active');

    // Student can log in again
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'dave@student.com', password: 'StudentPass123!' })
      .expect(200);
  });
});
