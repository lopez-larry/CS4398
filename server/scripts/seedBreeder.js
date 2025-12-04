// server/scripts/seedBreeder.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');   // <- fixed path
const User = require('../models/User');

(async () => {
  try {
    await connectDB();

    const breeders = [
      {
        username: 'bluekennels',
        email: 'bluekennels@example.com',
        password: 'test1234', // plain text for now; hash if you want real login
        role: 'breeder',
        isVerified: true,
        breederProfile: {
          kennelName: 'Blue Frenchies',
          location: { city: 'Austin', state: 'TX', country: 'USA' },
          description: 'Breeder of rare blue French bulldogs.',
        },
      },
      {
        username: 'goldenhearts',
        email: 'goldenhearts@example.com',
        password: 'test1234',
        role: 'breeder',
        isVerified: true,
        breederProfile: {
          kennelName: 'Golden Hearts Retrievers',
          location: { city: 'Denver', state: 'CO', country: 'USA' },
          description: 'Family breeder specializing in Golden Retrievers.',
        },
      },
    ];

    await User.insertMany(breeders);
    console.log('✅ Seeded breeders successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding breeders:', err);
    process.exit(1);
  }
})();
