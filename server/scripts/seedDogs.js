/**
 * @file server/scripts/seedDogs.js
 * Seeds example dogs and assigns them to the seeded breeder user.
 */

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DogMod = require('../models/Dog');
const Dog = DogMod.default || DogMod;

const UserMod = require('../models/User');
const User = UserMod.default || UserMod;

const BreedMod = require('../models/Breed');
const Breed = BreedMod.default || BreedMod;

const uri = process.env.MONGO_URI;

function makeSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function getBreederUser() {
  const breeder = await User.findOne({ role: 'breeder' });
  if (!breeder) throw new Error("No breeder user with role 'breeder' found.");
  return breeder;
}

async function getBreedIdByName(name) {
  const breed = await Breed.findOne({ name });
  if (!breed) throw new Error(`Breed not found: ${name}`);
  return breed._id;
}

async function main() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const breeder = await getBreederUser();
    console.log(`Using breeder: ${breeder.email} (${breeder._id})`);

    // To fully reset dogs, uncomment:
    // await Dog.deleteMany({});
    // console.log("Cleared old dogs");

    const dogs = [
      {
        name: "Max",
        sex: "male",
        ageMonths: 36,
        breedName: "Golden Retriever",
        description: "Friendly Golden Retriever with AKC registration.",
        imageKey: null,
      },
      {
        name: "Bella",
        sex: "female",
        ageMonths: 48,
        breedName: "German Shepherd",
        description: "Protective yet loving German Shepherd.",
        imageKey: null,
      },
      {
        name: "Charlie",
        sex: "male",
        ageMonths: 60,
        breedName: "Bulldog",
        description: "Calm Bulldog with great temperament.",
        imageKey: null,
      },
    ];

    const docs = [];

    for (const d of dogs) {
      const breedId = await getBreedIdByName(d.breedName);

      docs.push({
        breeder: breeder._id,
        name: d.name,
        slug: makeSlug(d.name),   // <---- FIX
        sex: d.sex,
        ageMonths: d.ageMonths,
        breed: breedId,
        description: d.description,
        imageKey: d.imageKey,
        status: "published",
        visibility: "public",
      });
    }

    await Dog.insertMany(docs);

    console.log(`Inserted ${docs.length} dogs.`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

main();
