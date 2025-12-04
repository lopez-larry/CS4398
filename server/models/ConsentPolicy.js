// models/ConsentPolicy.js
const mongoose = require('mongoose');

const ConsentPolicySchema = new mongoose.Schema(
  {
    version: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,  // adds createdAt + updatedAt
    versionKey: false, // hides __v
  }
);

module.exports = mongoose.model('ConsentPolicy', ConsentPolicySchema);
