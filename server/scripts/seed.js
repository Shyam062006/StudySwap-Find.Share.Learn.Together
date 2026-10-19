'use strict';

/**
 * Seed the database with sample academic resources.
 *
 * Usage: node scripts/seed.js
 *
 * Creates a seed student user and 8 sample published resources.
 * Safe to run multiple times — skips if seed data already exists.
 */

require('dotenv/config');

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { connectDB, closeDatabaseConnection } = require('../src/config/database');

const UPLOAD_DIR = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');

const SEED_MARKER = 'studyswap_seed_v1';

const sampleResources = [
  {
    title: 'DBMS Unit 3 Notes - Relational Algebra & SQL',
    description: 'Comprehensive notes covering relational algebra, SQL queries, normalization concepts, and transaction management. Includes solved examples and practice questions for university exams.',
    college: 'National Engineering College',
    degree: 'B.E',
    branch: 'CSE',
    semester: 5,
    subject: 'Database Management Systems',
    unit: 'Unit 3 - SQL & Relational Algebra',
    resourceType: 'notes',
    tags: ['dbms', 'sql', 'relational-algebra', 'normalization'],
    filename: 'DBMS_Unit3_Notes.pdf',
    mimeType: 'application/pdf',
  },
  {
    title: 'Java OOP Concepts - Complete Guide',
    description: 'Detailed presentation covering Object-Oriented Programming concepts in Java including classes, objects, inheritance, polymorphism, abstraction, and encapsulation with code examples.',
    college: 'REC Chennai',
    degree: 'B.E',
    branch: 'CSE',
    semester: 3,
    subject: 'Object Oriented Programming',
    unit: 'Unit 2 - OOP Fundamentals',
    resourceType: 'presentation',
    tags: ['java', 'oop', 'inheritance', 'polymorphism'],
    filename: 'Java_OOP_Concepts.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  {
    title: 'Operating Systems Previous Year Papers (2022-2024)',
    description: 'Collection of previous year university exam question papers for Operating Systems. Covers process management, memory management, file systems, and deadlocks.',
    college: 'Anna University',
    degree: 'B.E',
    branch: 'CSE',
    semester: 5,
    subject: 'Operating Systems',
    unit: '',
    resourceType: 'previousPaper',
    tags: ['os', 'previous-papers', 'exam', 'process-management'],
    filename: 'OS_Previous_Papers_2022_2024.pdf',
    mimeType: 'application/pdf',
  },
  {
    title: 'Data Structures Lab Programs with Outputs',
    description: 'Complete set of Data Structures lab programs including linked lists, stacks, queues, trees, graphs, and sorting algorithms. Each program includes source code and sample output.',
    college: 'SRM University',
    degree: 'B.Tech',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    unit: '',
    resourceType: 'labRecord',
    tags: ['data-structures', 'lab', 'programs', 'linked-list', 'sorting'],
    filename: 'DS_Lab_Programs.pdf',
    mimeType: 'application/pdf',
  },
  {
    title: 'Computer Networks Notes - All Units',
    description: 'Complete lecture notes for Computer Networks covering OSI model, TCP/IP, routing protocols, network security, and application layer protocols.',
    college: 'VIT Vellore',
    degree: 'B.Tech',
    branch: 'CSE',
    semester: 6,
    subject: 'Computer Networks',
    unit: 'All Units',
    resourceType: 'notes',
    tags: ['computer-networks', 'tcp-ip', 'osi', 'routing'],
    filename: 'CN_Complete_Notes.pdf',
    mimeType: 'application/pdf',
  },
  {
    title: 'Software Engineering Question Bank with Answers',
    description: 'Comprehensive question bank for Software Engineering covering SDLC models, requirements engineering, software design, testing, and project management.',
    college: 'PSG Tech',
    degree: 'B.E',
    branch: 'CSE',
    semester: 6,
    subject: 'Software Engineering',
    unit: '',
    resourceType: 'questionBank',
    tags: ['software-engineering', 'question-bank', 'sdlc', 'testing'],
    filename: 'SE_Question_Bank.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    title: 'Web Development Lab Manual - HTML, CSS, JS',
    description: 'Lab manual covering full stack web development experiments using HTML5, CSS3, JavaScript, React, Node.js, and Express.js. Includes step-by-step instructions and code.',
    college: 'BITS Pilani',
    degree: 'B.E',
    branch: 'IT',
    semester: 5,
    subject: 'Web Development',
    unit: '',
    resourceType: 'labManual',
    tags: ['web-development', 'html', 'css', 'javascript', 'lab-manual'],
    filename: 'Web_Dev_Lab_Manual.pdf',
    mimeType: 'application/pdf',
  },
  {
    title: 'Computer Organization & Architecture Notes',
    description: 'Detailed notes on Computer Organization covering CPU design, memory hierarchy, cache, pipelining, I/O systems, and RISC vs CISC architectures.',
    college: 'NIT Trichy',
    degree: 'B.Tech',
    branch: 'CSE',
    semester: 4,
    subject: 'Computer Organization',
    unit: 'Unit 1-5',
    resourceType: 'notes',
    tags: ['coa', 'cpu', 'pipelining', 'memory', 'cache'],
    filename: 'COA_Notes_Complete.pdf',
    mimeType: 'application/pdf',
  },
];

function createPlaceholderFile(filepath, title) {
  const content = `This is a placeholder file for: ${title}\nGenerated by StudySwap seed script.\nReplace with actual academic content for production use.\n`;
  fs.writeFileSync(filepath, content, 'utf8');
}

async function main() {
  try {
    const db = await connectDB();
    console.log('✅ Connected to MongoDB.');

    // Check if already seeded
    const existing = await db.collection('resources').findOne({ _seedMarker: SEED_MARKER });
    if (existing) {
      console.log('⚠️  Database already seeded. Skipping.');
      process.exit(0);
    }

    // Create seed student user
    const seedEmail = 'student@studyswap.dev';
    let seedUser = await db.collection('users').findOne({ email: seedEmail });

    if (!seedUser) {
      const passwordHash = await bcrypt.hash('Student123!', 12);
      const result = await db.collection('users').insertOne({
        name: 'StudySwap Student',
        email: seedEmail,
        passwordHash,
        role: 'student',
        college: 'StudySwap University',
        degree: 'B.E',
        branch: 'CSE',
        semester: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      seedUser = { _id: result.insertedId };
      console.log('👤 Created seed student user (student@studyswap.dev / Student123!)');
    }

    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Insert resources
    const now = new Date();
    const resources = [];

    for (let i = 0; i < sampleResources.length; i++) {
      const r = sampleResources[i];
      const storedFilename = `seed_${Date.now()}_${i}_${r.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const storagePath = path.join('uploads', storedFilename);
      const fullPath = path.join(UPLOAD_DIR, storedFilename);

      // Create a placeholder file
      createPlaceholderFile(fullPath, r.title);
      const fileSize = fs.statSync(fullPath).size;

      resources.push({
        title: r.title,
        description: r.description,
        college: r.college,
        degree: r.degree,
        branch: r.branch,
        semester: r.semester,
        subject: r.subject,
        unit: r.unit,
        resourceType: r.resourceType,
        tags: r.tags,
        originalFilename: r.filename,
        storedFilename,
        storagePath,
        mimeType: r.mimeType,
        fileSize,
        uploaderId: seedUser._id,
        moderationStatus: 'approved',
        moderationReason: '',
        approvedBy: null,
        approvedAt: now,
        downloadCount: Math.floor(Math.random() * 50) + 5,
        averageRating: +(Math.random() * 2 + 3).toFixed(1),
        ratingCount: Math.floor(Math.random() * 15) + 3,
        _seedMarker: SEED_MARKER,
        createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: now,
      });
    }

    await db.collection('resources').insertMany(resources);
    console.log(`📚 Inserted ${resources.length} sample resources.`);

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('resources').createIndex({ moderationStatus: 1 });
    await db.collection('resources').createIndex({ uploaderId: 1 });
    await db.collection('resources').createIndex({ branch: 1, semester: 1, subject: 1 });
    await db.collection('resources').createIndex(
      { title: 'text', description: 'text', subject: 'text', tags: 'text' },
      { name: 'resource_text_search' }
    );
    await db.collection('bookmarks').createIndex({ userId: 1, resourceId: 1 }, { unique: true });
    await db.collection('ratings').createIndex({ userId: 1, resourceId: 1 }, { unique: true });
    await db.collection('ratings').createIndex({ resourceId: 1 });
    await db.collection('reviews').createIndex({ resourceId: 1 });
    await db.collection('downloads').createIndex({ resourceId: 1 });
    await db.collection('reports').createIndex({ status: 1 });
    await db.collection('notifications').createIndex({ recipientId: 1, isRead: 1 });
    await db.collection('contributionTransactions').createIndex({ uniqueReference: 1 }, { unique: true });
    await db.collection('contributionTransactions').createIndex({ userId: 1 });

    console.log('🔍 Created database indexes.');
    console.log('\n✅ Seed complete! You can now browse resources in the Material Hub.\n');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

main();
