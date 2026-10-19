'use strict';

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

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
    uploader: 'praveen',
  },
  {
    title: 'Java OOP Concepts - Complete Guide',
    description: 'Detailed presentation covering Object-Oriented Programming concepts in Java including classes, objects, inheritance, polymorphism, abstraction, and encapsulation with code examples.',
    college: 'National Engineering College',
    degree: 'B.E',
    branch: 'CSE',
    semester: 5,
    subject: 'Object Oriented Programming',
    unit: 'Unit 2 - OOP Fundamentals',
    resourceType: 'presentation',
    tags: ['java', 'oop', 'inheritance', 'polymorphism'],
    filename: 'Java_OOP_Concepts.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    uploader: 'praveen',
  },
  {
    title: 'Operating Systems Previous Year Papers (2022-2024)',
    description: 'Collection of previous year university exam question papers for Operating Systems. Covers process management, memory management, file systems, and deadlocks.',
    college: 'National Engineering College',
    degree: 'B.E',
    branch: 'CSE',
    semester: 5,
    subject: 'Operating Systems',
    unit: '',
    resourceType: 'previousPaper',
    tags: ['os', 'previous-papers', 'exam-prep', 'pyq'],
    filename: 'OS_Previous_Papers_2022_2024.pdf',
    mimeType: 'application/pdf',
    uploader: 'praveen',
  },
  {
    title: 'Data Structures Lab Programs with Outputs',
    description: 'Complete lab record containing C programs for stacks, queues, linked lists, binary search trees, graph traversals (BFS/DFS), and sorting algorithms with sample outputs.',
    college: 'National Engineering College',
    degree: 'B.E',
    branch: 'CSE',
    semester: 5,
    subject: 'Data Structures',
    unit: 'Lab Programs 1-12',
    resourceType: 'labRecord',
    tags: ['dsa', 'lab', 'c-programming', 'trees', 'graphs'],
    filename: 'DSA_Lab_Programs_Complete.pdf',
    mimeType: 'application/pdf',
    uploader: 'praveen',
  },
  {
    title: 'Computer Networks Notes - All Units',
    description: 'Complete syllabus notes for Computer Networks covering OSI model, TCP/IP, IP addressing, subnetting, routing protocols (RIP, OSPF, BGP), and network security basics.',
    college: 'National Engineering College',
    degree: 'B.E',
    branch: 'CSE',
    semester: 5,
    subject: 'Computer Networks',
    unit: 'Units 1-5 Complete',
    resourceType: 'notes',
    tags: ['cn', 'networking', 'tcp-ip', 'routing', 'osi'],
    filename: 'Computer_Networks_Complete_Notes.pdf',
    mimeType: 'application/pdf',
    uploader: 'praveen',
  },
  {
    title: 'Software Engineering Question Bank with Answers',
    description: 'Comprehensive question bank for Software Engineering covering SDLC models, requirements engineering, software design, testing, and project management.',
    college: 'National Engineering College',
    degree: 'B.E',
    branch: 'CSE',
    semester: 5,
    subject: 'Software Engineering',
    unit: '',
    resourceType: 'questionBank',
    tags: ['software-engineering', 'question-bank', 'sdlc', 'testing'],
    filename: 'SE_Question_Bank.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploader: 'praveen',
  },
  {
    title: 'DAA Algorithms Complete Notes',
    description: 'Complete Design and Analysis of Algorithms notes covering Divide and Conquer, Dynamic Programming, Greedy Method, and Backtracking.',
    college: 'National Engineering College',
    degree: 'B.E',
    branch: 'CSE',
    semester: 5,
    subject: 'Design & Analysis of Algorithms',
    unit: 'Units 1-4',
    resourceType: 'notes',
    tags: ['daa', 'algorithms', 'dp', 'greedy'],
    filename: 'DAA_Complete_Notes.pdf',
    mimeType: 'application/pdf',
    uploader: 'neelish',
  },
];

async function autoSeed(db) {
  try {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 1. Ensure Praveen and Neelish exist
    const passwordHash = await bcrypt.hash('Student123!', 10);
    const now = new Date();

    let praveen = await db.collection('users').findOne({ email: 'praveen@studyswap.dev' });
    if (!praveen) {
      const res = await db.collection('users').insertOne({
        name: 'Praveen',
        email: 'praveen@studyswap.dev',
        passwordHash,
        role: 'student',
        college: 'National Engineering College',
        degree: 'B.E',
        branch: 'CSE',
        semester: 5,
        contributionPoints: 60,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      praveen = { _id: res.insertedId };
      console.log('[AutoSeed] Created student Praveen');
    }

    let neelish = await db.collection('users').findOne({ email: 'neelish@studyswap.dev' });
    if (!neelish) {
      const res = await db.collection('users').insertOne({
        name: 'Neelish',
        email: 'neelish@studyswap.dev',
        passwordHash,
        role: 'student',
        college: 'National Engineering College',
        degree: 'B.E',
        branch: 'CSE',
        semester: 5,
        contributionPoints: 60,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      neelish = { _id: res.insertedId };
      console.log('[AutoSeed] Created student Neelish');
    }

    // 2. Ensure resources exist
    const resourceCount = await db.collection('resources').countDocuments();
    if (resourceCount === 0) {
      const docs = sampleResources.map((r, i) => {
        const uploaderId = r.uploader === 'neelish' ? neelish._id : praveen._id;
        const storedFilename = `seed_${Date.now()}_${i}_${r.filename}`;
        const storagePath = path.join('uploads', storedFilename);
        const fullPath = path.join(uploadDir, storedFilename);

        // Create sample placeholder file if not exists
        if (!fs.existsSync(fullPath)) {
          fs.writeFileSync(fullPath, `%PDF-1.4 ${r.title} - StudySwap Sample Resource Content`);
        }

        return {
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
          fileSize: 1024,
          uploaderId,
          moderationStatus: 'approved',
          moderationReason: '',
          approvedBy: null,
          approvedAt: now,
          downloadCount: 20 + i * 5,
          averageRating: 5.0,
          ratingCount: 5 + i,
          createdAt: new Date(Date.now() - (i + 1) * 86400000),
          updatedAt: now,
        };
      });

      await db.collection('resources').insertMany(docs);
      console.log(`[AutoSeed] Seeded ${docs.length} sample resources.`);
    }

    // 3. Ensure indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true }).catch(() => {});
    await db.collection('resources').createIndex({ moderationStatus: 1 }).catch(() => {});
    await db.collection('resources').createIndex({ uploaderId: 1 }).catch(() => {});
    await db.collection('resources').createIndex({ branch: 1, semester: 1 }).catch(() => {});
    await db.collection('bookmarks').createIndex({ userId: 1, resourceId: 1 }, { unique: true }).catch(() => {});
    await db.collection('ratings').createIndex({ userId: 1, resourceId: 1 }, { unique: true }).catch(() => {});
  } catch (err) {
    console.error('[AutoSeed] Error during autoseed:', err.message);
  }
}

module.exports = { autoSeed };
