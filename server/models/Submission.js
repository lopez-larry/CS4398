/**
 * @file Submission.js
 * @description Defines the Mongoose schema and model for contact form submissions.
 *
 * Features:
 *  - Stores name, message, and optional email of the submitter.
 *  - Automatically tracks creation and update timestamps.
 *
 * Dependencies:
 *  - mongoose: MongoDB object modeling library.
 */

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    message: { type: String, required: true },
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], // optional, validates if provided
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Submission', submissionSchema);
