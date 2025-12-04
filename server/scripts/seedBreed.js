/**
 * @file server/scripts/seedBreed.js
 * Seeds initial dog breeds into the database.
 */

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load .env (resolve relative to scripts/)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Model
const BreedMod = require('../models/Breed');
const Breed = BreedMod.default || BreedMod;

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/pam';

async function main() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Mongo connected for seeding breeds');

    // List of breeds to seed (add as many as you like)
    const breedNames = [
      'Golden Retriever',
      'German Shepherd',
      'Bulldog',
      'French Bulldog',
      'Poodle',
      'Labrador Retriever',
    ];

    // Upsert breeds (don’t insert duplicates)
    for (const name of breedNames) {
      const existing = await Breed.findOne({ name });
      if (!existing) {
        await Breed.create({ name });
        console.log(`🌱 Created breed: ${name}`);
      } else {
        console.log(`Breed already exists: ${name}`);
      }
    }

    const count = await Breed.countDocuments();
    console.log(`✅ Total breeds in DB: ${count}`);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

main();
