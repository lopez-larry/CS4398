// scripts/verifyUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/verifyUser.js <email>');
  process.exit(1);
}

(async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) throw new Error('Missing MONGO_URI in .env');

    await mongoose.connect(uri);
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: { isVerified: true },
        $unset: { emailVerifyToken: '', emailVerifyExpire: '' },
      },
      { new: true }
    ).lean();

    if (!user) {
      console.error('No user found for', email);
      process.exit(2);
    }
    console.log('Verified:', { email: user.email, isVerified: user.isVerified });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
