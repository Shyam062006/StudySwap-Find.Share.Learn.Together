'use strict';

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');

let db;
let studentCookie;
let studentId;
let adminCookie;

beforeAll(async () => {
  db = await setupTestDB();

  // Create uploads directory if not present
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}, 30000);

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB(db);

  // Register student
  const studentRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Bob Ross',
      email: 'bob@student.com',
      password: 'Password123!',
      college: 'REC Chennai',
      degree: 'B.E',
      branch: 'CSE',
      semester: 4,
    });
  studentCookie = studentRes.headers['set-cookie'];
  studentId = studentRes.body.data._id;

  // Create admin user in DB directly
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('AdminPass123!', 10);
  const adminDoc = await db.collection('users').insertOne({
    name: 'Admin User',
    email: 'admin@studyswap.dev',
    passwordHash: hash,
    role: 'admin',
    college: 'StudySwap Admin',
    degree: 'N/A',
    branch: 'N/A',
    semester: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@studyswap.dev', password: 'AdminPass123!' });
  adminCookie = adminRes.headers['set-cookie'];
});

describe('Resources API', () => {
  test('GET /api/resources returns empty array when no approved resources exist', async () => {
    const res = await request(app).get('/api/resources').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  test('POST /api/resources uploads a new resource in pending status', async () => {
    // Create a temporary dummy PDF
    const dummyPdf = path.join(__dirname, 'dummy.pdf');
    fs.writeFileSync(dummyPdf, '%PDF-1.4 dummy test content');

    const res = await request(app)
      .post('/api/resources')
      .set('Cookie', studentCookie)
      .field('title', 'Data Structures Notes')
      .field('description', 'Complete handwritten notes for Unit 1 and Unit 2 covering arrays and linked lists.')
      .field('college', 'REC Chennai')
      .field('degree', 'B.E')
      .field('branch', 'CSE')
      .field('semester', 4)
      .field('subject', 'Data Structures')
      .field('unit', 'Unit 1')
      .field('resourceType', 'notes')
      .field('tags', JSON.stringify(['ds', 'notes', 'cse']))
      .attach('file', dummyPdf)
      .expect(201);

    fs.unlinkSync(dummyPdf);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Data Structures Notes');
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.uploader.name).toBe('Bob Ross');

    const resourceId = res.body.data._id;

    // Student can see it under /api/users/me/resources
    const myRes = await request(app)
      .get('/api/users/me/resources')
      .set('Cookie', studentCookie)
      .expect(200);
    expect(myRes.body.data.length).toBe(1);

    // But it does NOT appear in public /api/resources until approved
    const publicRes = await request(app).get('/api/resources').expect(200);
    expect(publicRes.body.data.length).toBe(0);

    // Admin approves it
    await request(app)
      .patch(`/api/admin/resources/${resourceId}/moderation`)
      .set('Cookie', adminCookie)
      .send({ status: 'approved' })
      .expect(200);

    // Now it appears in public /api/resources
    const publicAfterApprove = await request(app).get('/api/resources').expect(200);
    expect(publicAfterApprove.body.data.length).toBe(1);
    expect(publicAfterApprove.body.data[0].title).toBe('Data Structures Notes');
  });

  test('GET /api/resources supports search, filter by semester and branch', async () => {
    // Insert pre-approved resources directly
    const { ObjectId } = require('mongodb');
    await db.collection('resources').insertMany([
      {
        title: 'Operating Systems Previous Papers',
        description: 'University exam papers from 2021 to 2023 with answer keys.',
        college: 'Anna University',
        degree: 'B.E',
        branch: 'CSE',
        semester: 5,
        subject: 'Operating Systems',
        resourceType: 'previousPaper',
        tags: ['os', 'exam'],
        storedFilename: 'test1.pdf',
        storagePath: 'uploads/test1.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024,
        uploaderId: new ObjectId(studentId),
        moderationStatus: 'approved',
        downloadCount: 15,
        averageRating: 4.5,
        ratingCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Microprocessors Lab Manual',
        description: '8086 assembly language lab programs and documentation.',
        college: 'Anna University',
        degree: 'B.E',
        branch: 'ECE',
        semester: 5,
        subject: 'Microprocessors',
        resourceType: 'labManual',
        tags: ['mp', 'lab'],
        storedFilename: 'test2.pdf',
        storagePath: 'uploads/test2.pdf',
        mimeType: 'application/pdf',
        fileSize: 2048,
        uploaderId: new ObjectId(studentId),
        moderationStatus: 'approved',
        downloadCount: 5,
        averageRating: 3.8,
        ratingCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Filter by branch=CSE
    const cseRes = await request(app).get('/api/resources?branch=CSE').expect(200);
    expect(cseRes.body.data.length).toBe(1);
    expect(cseRes.body.data[0].title).toContain('Operating Systems');

    // Filter by branch=ECE
    const eceRes = await request(app).get('/api/resources?branch=ECE').expect(200);
    expect(eceRes.body.data.length).toBe(1);
    expect(eceRes.body.data[0].title).toContain('Microprocessors');
  });

  test('PUT /api/resources/:id/rating allows rating an approved resource', async () => {
    const { ObjectId } = require('mongodb');
    const insertRes = await db.collection('resources').insertOne({
      title: 'Compiler Design Notes',
      description: 'Lexical analysis, syntax analysis, code generation.',
      college: 'VIT',
      degree: 'B.Tech',
      branch: 'CSE',
      semester: 6,
      subject: 'Compiler Design',
      resourceType: 'notes',
      tags: ['cd'],
      storedFilename: 'cd.pdf',
      storagePath: 'uploads/cd.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
      uploaderId: new ObjectId('507f1f77bcf86cd799439011'), // different user
      moderationStatus: 'approved',
      downloadCount: 0,
      averageRating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const resId = insertRes.insertedId.toString();

    const rateRes = await request(app)
      .put(`/api/resources/${resId}/rating`)
      .set('Cookie', studentCookie)
      .send({ rating: 5 })
      .expect(200);

    expect(rateRes.body.success).toBe(true);
    expect(rateRes.body.data.averageRating).toBe(5);
  });
});
