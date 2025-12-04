/**
 * @file breedRoutes.js
 * @description Routes for managing dog breeds
 */

const express = require('express');
const Breed = require('../models/Breed');

const router = express.Router();

// ---------------------------------------------
// GET all breeds (for dropdowns)
// ---------------------------------------------
router.get('/', async (req, res) => {
  try {
    const breeds = await Breed.find().sort({ name: 1 });
    res.json(breeds);
  } catch (err) {
    console.error('Error fetching breeds:', err);
    res.status(500).json({ message: 'Server error fetching breeds' });
  }
});

// ---------------------------------------------
// POST new breed (admin-only in future)
// ---------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Breed name is required' });

    const exists = await Breed.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Breed already exists' });

    const breed = new Breed({ name });
    await breed.save();
    res.status(201).json(breed);
  } catch (err) {
    console.error('Error creating breed:', err);
    res.status(500).json({ message: 'Server error creating breed' });
  }
});

module.exports = router;
