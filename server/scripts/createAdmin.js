'use strict';

/**
 * Create an admin user account.
 *
 * Usage:
 *   node scripts/createAdmin.js
 *   node scripts/createAdmin.js --name="Admin" --email="admin@test.com" --password="Pass123!"
 */

require('dotenv/config');

const readline = require('readline');
const bcrypt = require('bcryptjs');
const { connectDB, closeDatabaseConnection } = require('../src/config/database');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) args[match[1]] = match[2];
  });
  return args;
}

function prompt(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const cliArgs = parseArgs();

  let name = cliArgs.name;
  let email = cliArgs.email;
  let password = cliArgs.password;

  // If args not provided, prompt interactively
  if (!name || !email || !password) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n🔐 StudySwap Admin Account Creator\n');

    if (!name) name = await prompt(rl, 'Admin name: ');
    if (!email) email = await prompt(rl, 'Admin email: ');
    if (!password) password = await prompt(rl, 'Admin password (min 8 chars): ');

    rl.close();
  }

  // Validate
  if (!name || name.trim().length < 2) {
    console.error('❌ Name must be at least 2 characters.');
    process.exit(1);
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    console.error('❌ Please provide a valid email.');
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters.');
    process.exit(1);
  }

  try {
    const db = await connectDB();
    console.log('✅ Connected to MongoDB.');

    // Check if email already exists
    const existing = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (existing.role === 'admin') {
        console.log('⚠️  An admin account with this email already exists.');
      } else {
        console.log('⚠️  A student account with this email already exists. Upgrading to admin...');
        await db.collection('users').updateOne(
          { _id: existing._id },
          { $set: { role: 'admin', updatedAt: new Date() } }
        );
        console.log('✅ Account upgraded to admin role.');
      }
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin user
    const adminUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'admin',
      college: 'StudySwap Admin',
      degree: 'N/A',
      branch: 'N/A',
      semester: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(adminUser);
    console.log(`\n✅ Admin account created successfully!`);
    console.log(`   ID:    ${result.insertedId}`);
    console.log(`   Name:  ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role:  admin\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

main();
