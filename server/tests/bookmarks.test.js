'use strict';

const request = require('supertest');
const { ObjectId } = require('mongodb');
const app = require('../src/app');
const { setupTestDB, teardownTestDB, clearTestDB } = require('./setup');

let db;
let studentCookie;
let studentId;
let sampleResourceId;

beforeAll(async () => {
  db = await setupTestDB();
}, 30000);

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB(db);

  const studentRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Carol Danvers',
      email: 'carol@test.com',
      password: 'Password123!',
      college: 'SRM Institute',
      degree: 'B.Tech',
      branch: 'IT',
      semester: 3,
    });
  studentCookie = studentRes.headers['set-cookie'];
  studentId = studentRes.body.data._id;

  const resDoc = await db.collection('resources').insertOne({
    title: 'Python for Data Science',
    description: 'Pandas, NumPy, and Matplotlib tutorials with code snippets.',
    college: 'SRM Institute',
    degree: 'B.Tech',
    branch: 'IT',
    semester: 3,
    subject: 'Data Science',
    resourceType: 'notes',
    tags: ['python', 'ds'],
    storedFilename: 'python.pdf',
    storagePath: 'uploads/python.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024,
    uploaderId: new ObjectId(studentId),
    moderationStatus: 'approved',
    downloadCount: 0,
    averageRating: 0,
    ratingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  sampleResourceId = resDoc.insertedId.toString();
});

describe('Bookmarks API', () => {
  test('POST /api/bookmarks/:id adds a bookmark and GET /api/bookmarks lists it', async () => {
    // Add bookmark
    const addRes = await request(app)
      .post(`/api/bookmarks/${sampleResourceId}`)
      .set('Cookie', studentCookie)
      .expect(201);

    expect(addRes.body.success).toBe(true);

    // Get bookmarks
    const listRes = await request(app)
      .get('/api/bookmarks')
      .set('Cookie', studentCookie)
      .expect(200);

    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0]._id.toString()).toBe(sampleResourceId);
    expect(listRes.body.data[0].isBookmarked).toBe(true);
  });

  test('DELETE /api/bookmarks/:id removes a bookmark', async () => {
    await request(app)
      .post(`/api/bookmarks/${sampleResourceId}`)
      .set('Cookie', studentCookie);

    const delRes = await request(app)
      .delete(`/api/bookmarks/${sampleResourceId}`)
      .set('Cookie', studentCookie)
      .expect(200);

    expect(delRes.body.success).toBe(true);

    const listRes = await request(app)
      .get('/api/bookmarks')
      .set('Cookie', studentCookie)
      .expect(200);

    expect(listRes.body.data.length).toBe(0);
  });
});
