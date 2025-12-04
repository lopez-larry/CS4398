/**
 * @file Dog.js
 * @description Dog model with reference to Breed and Breeder
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const DogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    breeder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    breed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Breed',
      required: true,
    },

    description: { type: String, trim: true },

    sex: {
      type: String,
      enum: ['male', 'female'],
      required: true
    },

    ageMonths: { type: Number, min: 0 },

    imageKey: { type: String, trim: true },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },

    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },

    slug: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

// Auto-generate unique slug per dog
DogSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();

  const baseSlug = slugify(this.name, { lower: true, strict: true }) || "dog";
  const uniquePart = this._id ? this._id.toString().slice(-6) : Date.now();

  this.slug = `${baseSlug}-${uniquePart}`;
  next();
});

module.exports = mongoose.model('Dog', DogSchema);
