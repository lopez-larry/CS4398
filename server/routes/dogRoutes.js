/**
 * @file dogRoutes.js
 * @description Routes for managing dogs (CRUD, filters, favorites, signed URLs)
 */

const { Router } = require('express');

const DogMod = require('../models/Dog');
const Dog = DogMod.default || DogMod;

const UserMod = require('../models/User');
const User = UserMod.default || UserMod;

// Role constants fallback
const ROLES =
  (UserMod && UserMod.ROLES) ||
  { ADMIN: 'admin', BREEDER: 'breeder', CUSTOMER: 'customer' };

// Auth middleware
const jwtAuth = require('../middleware/jwtAuth');

// Role helper
const hasRole = (user, role) => {
  if (!user) return false;
  if (Array.isArray(user.roles)) return user.roles.includes(role);
  if (typeof user.role === 'string') return user.role === role;
  return false;
};

const requireAnyRole = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const ok = allowed.some((r) => hasRole(req.user, r));
  if (!ok) return res.status(403).json({ message: 'Forbidden' });
  next();
};

const router = Router();

// S3 Signed URL support
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3 } = require('../config/s3');

async function attachSignedImage(dog) {
  const plain = dog.toObject();
  if (dog.imageKey) {
    try {
      plain.imageUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: dog.imageKey,
        }),
        { expiresIn: 3600 }
      );
    } catch (err) {
      console.error('Signed URL error:', err);
      plain.imageUrl = null;
    }
  }
  return plain;
}

/**
 * GET /api/dogs
 * Supports filtering by breed name: ?search=labrador
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "" } = req.query;

    const pg = Math.max(1, Number(page));
    const lim = Math.min(100, Math.max(1, Number(limit)));

    const matchStage = {
      status: 'published',
      visibility: 'public'
    };

    if (search) {
      matchStage.$expr = {
        $regexMatch: {
          input: { $toLower: "$breedName" },
          regex: search.toLowerCase(),
          options: "i"
        }
      };
    }

    const pipeline = [
      {
        $lookup: {
          from: "breeds",
          localField: "breed",
          foreignField: "_id",
          as: "breed"
        }
      },
      { $unwind: "$breed" },
      {
        $addFields: {
          breedName: "$breed.name"
        }
      },
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: (pg - 1) * lim },
      { $limit: lim }
    ];

    const results = await Dog.aggregate(pipeline);

    const totalResults = await Dog.aggregate([
      ...pipeline.slice(0, 4),
      { $count: "count" }
    ]);

    const total = totalResults[0]?.count || 0;

    // Attach signed image URLs
    const withUrls = await Promise.all(
      results.map(async (dog) => {
        if (dog.imageKey) {
          try {
            const url = await getSignedUrl(
              s3,
              new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: dog.imageKey,
              }),
              { expiresIn: 3600 }
            );
            dog.imageUrl = url;
          } catch (error) {
            dog.imageUrl = null;
          }
        }
        return dog;
      })
    );

    res.json({
      data: withUrls,
      page: pg,
      pages: Math.ceil(total / lim),
      total
    });
  } catch (e) {
    console.error("Error in GET /dogs:", e);
    res.status(500).json({ message: e.message });
  }
});

/**
 * GET /api/dogs/mine
 */
router.get('/mine', jwtAuth, requireAnyRole(ROLES.BREEDER, ROLES.ADMIN), async (req, res) => {
  try {
    const dogs = await Dog.find({ breeder: req.user._id })
      .sort({ createdAt: -1 })
      .populate('breed', 'name');

    const withUrls = await Promise.all(dogs.map(attachSignedImage));
    res.json({ data: withUrls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/dogs/id/:id
 */
router.get('/id/:id', async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id)
      .populate('breeder', 'kennelName firstName lastName email')
      .populate('breed', 'name');

    if (!dog) return res.status(404).json({ message: 'Dog not found' });

    const withUrl = await attachSignedImage(dog);
    res.json(withUrl);
  } catch (err) {
    console.error('Error fetching dog by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /api/dogs/:id
 */
router.put('/:id', jwtAuth, requireAnyRole(ROLES.BREEDER, ROLES.ADMIN), async (req, res) => {
  try {
    const dog = await Dog.findOneAndUpdate(
      { _id: req.params.id, breeder: req.user._id },
      req.body,
      { new: true }
    ).populate('breed', 'name');

    if (!dog) return res.status(404).json({ message: 'Dog not found' });

    const withUrl = await attachSignedImage(dog);
    res.json(withUrl);
  } catch (err) {
    console.error('Error updating dog:', err);
    res.status(500).json({ message: 'Failed to update dog' });
  }
});

/**
 * GET /api/dogs/favorites
 */
router.get('/favorites', jwtAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: [
        { path: 'breed', select: 'name' },
        { path: 'breeder', select: 'kennelName email' }
      ]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ favorites: user.favorites || [] });
  } catch (err) {
    console.error('GET /dogs/favorites:', err);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

/**
 * POST /api/dogs
 */
router.post(
  '/',
  jwtAuth,
  requireAnyRole(ROLES.BREEDER, ROLES.ADMIN),
  async (req, res) => {
    try {
      const { name, breed, description, sex, ageMonths, imageKey, status, visibility } = req.body;

      const dog = await Dog.create({
        breeder: req.user._id,
        name,
        breed,
        description,
        sex,
        ageMonths,
        imageKey,
        status: status || 'draft',
        visibility: visibility || 'public',
      });

      const savedDog = await Dog.findById(dog._id)
        .populate('breeder', 'kennelName firstName lastName email')
        .populate('breed', 'name');

      const withUrl = await attachSignedImage(savedDog);
      res.status(201).json(withUrl);
    } catch (err) {
      console.error('Error creating dog:', err);
      res.status(500).json({ message: 'Failed to create dog' });
    }
  }
);

// POST /api/dogs/:id/status — change publish/archive status
router.post(
  '/:id/status',
  jwtAuth,
  requireAnyRole(ROLES.BREEDER, ROLES.ADMIN),
  async (req, res) => {
    try {
      const dogId = req.params.id;
      const { status } = req.body;

      if (!['published', 'archived'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      const dog = await Dog.findOneAndUpdate(
        { _id: dogId, breeder: req.user._id },
        { status },
        { new: true }
      )
        .populate('breeder', 'kennelName email')
        .populate('breed', 'name');

      if (!dog) {
        return res.status(404).json({ message: 'Dog not found or not authorized' });
      }

      const withUrl = await attachSignedImage(dog);
      res.json(withUrl);
    } catch (err) {
      console.error('Error updating dog status:', err);
      res.status(500).json({ message: 'Failed to update dog status' });
    }
  }
);


/**
 * POST /api/dogs/favorites
 */
router.post('/favorites', jwtAuth, async (req, res) => {
  try {
    const { dogId } = req.body;
    if (!dogId) return res.status(400).json({ message: 'Dog ID required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.favorites.some(d => d.toString() === dogId)) {
      return res.status(400).json({ message: 'Dog already in favorites' });
    }

    user.favorites.push(dogId);
    await user.save();

    res.json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (err) {
    console.error('POST /dogs/favorites:', err);
    res.status(500).json({ message: 'Error adding favorite' });
  }
});

/**
 * DELETE /api/dogs/favorites
 */
router.delete('/favorites', jwtAuth, async (req, res) => {
  try {
    const { dogId } = req.body;
    if (!dogId) return res.status(400).json({ message: 'Dog ID required' });

    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(
      (d) => d.toString() !== dogId
    );
    await user.save();

    res.json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (err) {
    console.error('DELETE /dogs/favorites:', err);
    res.status(500).json({ message: 'Error removing favorite' });
  }
});

/**
 * DELETE /api/dogs/:id
 */
router.delete(
  '/:id',
  jwtAuth,
  requireAnyRole(ROLES.BREEDER, ROLES.ADMIN),
  async (req, res) => {
    try {
      const dog = await Dog.findOneAndDelete({
        _id: req.params.id,
        breeder: req.user._id
      });

      if (!dog) return res.status(404).json({ message: 'Dog not found or unauthorized' });

      res.json({ message: 'Dog deleted successfully' });
    } catch (err) {
      console.error('Error deleting dog:', err);
      res.status(500).json({ message: 'Failed to delete dog' });
    }
  }
);

module.exports = router;
