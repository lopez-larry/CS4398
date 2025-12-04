/**
 * @file server/scripts/seedUsers.js
 * Seeds admin, breeder, and customer users (single `role` string).
 */

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// Load .env (resolve relative to scripts/)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Load User model (CJS or ESM default)
const UserMod = require('../models/User');
const User = UserMod.default || UserMod;

// Role constants for convenience
const ROLES = { ADMIN: 'admin', BREEDER: 'breeder', CUSTOMER: 'customer' };

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/pam';

function localPart(email) {
  return String(email).toLowerCase().split('@')[0];
}

async function makeUser({
  email,
  password,
  role = ROLES.CUSTOMER,
  isVerified = true,
  breederProfile = null,
  firstName = '',
  lastName = '',
  profileImage = '',
  profileImageKey = '',
}) {
  const hashed = await bcrypt.hash(password, 10);
  const username = localPart(email);

  // Build doc that satisfies your current schema
  return {
    // identity
    email: email.toLowerCase(),
    username,                // required + unique
    role,                    // single string: 'admin' | 'breeder' | 'customer'
    isVerified,

    // auth (ONLY password field)
    password: hashed,

    // profile fields
    firstName,
    lastName,
    profileImage,
    profileImageKey,

    // breeder/customer extras
    breederProfile,
    favorites: [],

    // consent
    consent: {
      agreed: true,
      timestamp: new Date(),
      ip: '127.0.0.1',
      consentVersion: 'v1.0',
    },
  };
}

(async function seedUsers() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    console.log('Using DB:', mongoose.connection.name);

    // Clear users
    if (typeof User.deleteMany !== 'function') {
      throw new Error('Loaded User is not a Mongoose model. Check exports in server/models/User.js');
    }
    await User.deleteMany();
    console.log('🧹 Cleared users collection');

    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@example.com';
    const breederEmail  = process.env.BREEDER_EMAIL  || 'breeder@example.com';
    const customerEmail = process.env.CUSTOMER_EMAIL || 'customer@example.com';

    const users = await Promise.all([
      makeUser({
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Password123!',
        role: ROLES.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        profileImageKey: 'defaults/profile-placeholder.jpg',
      }),
      makeUser({
        email: breederEmail,
        password: process.env.BREEDER_PASSWORD || 'Password123!',
        role: ROLES.BREEDER,
        firstName: 'Breeder',
        lastName: 'User',
        profileImageKey: 'defaults/profile-placeholder.jpg',
        breederProfile: {
          kennelName: 'Happy Tails Kennel',
          website: 'https://happytails.example.com',
          phone: '555-123-4567',
          location: { city: 'Austin', state: 'TX', country: 'USA' },
        },
      }),
      makeUser({
        email: customerEmail,
        password: process.env.CUSTOMER_PASSWORD || 'Password123!',
        role: ROLES.CUSTOMER,
        firstName: 'Customer',
        lastName: 'User',
        profileImageKey: 'defaults/profile-placeholder.jpg',
      }),
    ]);

    await User.insertMany(users);

    console.log('✅ Seeded users:');
    users.forEach(u => {
      console.log(`  - ${u.role.toUpperCase()}: ${u.email} (username: ${u.username})`);
    });
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected');
  }
})();
