/**
 * @file db.js
 * @description Connects to MongoDB using Mongoose.
 *
 * Features:
 *  - Loads MongoDB URI from environment variables.
 *  - Establishes a connection using Mongoose.
 *  - Logs the connection host or exits on error.
 *
 * Dependencies:
 *  - mongoose
 */

// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      sanitizeFilter: true, // NoSQL injection protection
    });

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };

