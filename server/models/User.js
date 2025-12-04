/**
 * @file User.js
 * @description Defines the Mongoose schema and model for users.
 *
 * Features:
 *  - Stores authentication details, verification, consent, and profile data.
 *  - Supports roles: admin, breeder, customer.
 *  - Tracks favorites (saved dogs) and breeder reviews.
 *  - Tracks timestamps automatically.
 *  - Integrates with S3 for profile images.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ROLES = {
  ADMIN: 'admin',
  BREEDER: 'breeder',
  CUSTOMER: 'customer',
};

// -----------------------------
// Consent Subdocument Schema
// -----------------------------
const ConsentSchema = new Schema(
  {
    agreed: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    ip: String,
    consentVersion: { type: String, default: 'v1.0' },
  },
  { _id: false }
);

// -----------------------------
// Review Subdocument Schema
// -----------------------------
const ReviewSchema = new Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// -----------------------------
// Breeder Profile Subdocument
// -----------------------------
const BreederProfileSchema = new Schema(
  {
    kennelName: { type: String, trim: true },
    website: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    description: { type: String, trim: true },
  },
  { _id: false }
);

// -----------------------------
// Main User Schema
// -----------------------------
const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
      index: true,
    },

    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },

    profileImage: { type: String, default: '' },
    profileImageKey: { type: String },

    isVerified: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },

    emailVerifyToken: String,
    emailVerifyExpire: Date,
    resetToken: String,
    resetTokenExpire: Date,

    consent: { type: ConsentSchema, default: () => ({}) },

    breederProfile: BreederProfileSchema,

    // customer favorites
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dog' }],

    // breeder reviews
    reviews: [ReviewSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------
// Indexes
// ---------------------------------------------
UserSchema.index({ 'breederProfile.location.state': 1 });
UserSchema.index({ role: 1, isVerified: 1 });

// ---------------------------------------------
// Virtual: Profile Image URL (browser-safe)
// ---------------------------------------------
UserSchema.virtual('profileImageUrl').get(function () {
  if (this.profileImageKey) {
    // Use your backend route that serves S3 images
    return `/api/upload/image/${this.profileImageKey}`;
  }
  // fall back to direct URL if set
  if (this.profileImage) {
    return this.profileImage;
  }
  return null;
});

// ---------------------------------------------
// Virtual: Average Rating
// ---------------------------------------------
UserSchema.virtual('averageRating').get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  return Math.round((total / this.reviews.length) * 10) / 10;
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
module.exports.ROLES = ROLES;
