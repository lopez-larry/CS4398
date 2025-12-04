/**
 * @file adminRoutes.js
 * @description Defines admin-only routes for user management, metrics, and Breed oversight.
 */

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const jwtAuth = require('../middleware/jwtAuth');
const {ensureAdmin} = require('../middleware/authMiddleware');

const User = require('../models/User');
const {buildSafeUserResponse} = require('../utils/buildSafeUserResponse');
const {
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
    getAdminPostBySlug
} = require('../controllers/postController');
const Submission = require('../models/Submission');
const Breed = require('../models/Breed');

// Whitelisted fields
const ALLOWED_SORT_FIELDS = ['createdAt', 'name', 'email', 'username'];


/* -------------------------- USER MANAGEMENT -------------------------- */

// GET: Users with pagination/search/sort
router.get('/users', jwtAuth, ensureAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
        const search = (req.query.search || '').trim();
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = (req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;

        const query = search
            ? {
                $or: [
                    {email: new RegExp(search, 'i')},
                    {username: new RegExp(search, 'i')},
                ],
            }
            : {};

        const allowedSort = new Set(['email', 'username', 'role', 'createdAt', 'isLocked', 'isVerified', 'consent']);
        const sort = allowedSort.has(sortField) ? {[sortField]: sortOrder} : {createdAt: -1};

        const [users, total] = await Promise.all([
            User.find(query)
                .sort(sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .select('email username role createdAt isLocked isVerified consent'),
            User.countDocuments(query),
        ]);

        const safe = users.map(buildSafeUserResponse);

        res.json({
            users: safe,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        });
    } catch (err) {
        console.error('Admin list users failed:', err);
        res.status(500).json({message: 'Server error'});
    }
});

// PUT: Update user flags/role
router.put('/users/:id', jwtAuth, ensureAdmin, async (req, res) => {
    try {
        const {id} = req.params;
        const allowed = ['isVerified', 'role', 'isLocked'];
        const patch = {};
        for (const k of allowed) {
            if (Object.prototype.hasOwnProperty.call(req.body, k)) {
                patch[k] = req.body[k];
            }
        }
        if (Object.keys(patch).length === 0) {
            return res.status(400).json({message: 'No valid fields to update.'});
        }
        if (patch.role && !['admin', 'breeder', 'customer'].includes(patch.role)) {
            return res.status(400).json({message: 'Invalid role.'});
        }

        const updated = await User.findByIdAndUpdate(id, patch, {
            new: true,
            runValidators: true,
            fields: 'email username role createdAt isLocked isVerified consent'
        });
        if (!updated) return res.status(404).json({message: 'User not found.'});

        res.json({user: buildSafeUserResponse(updated)});
    } catch (err) {
        console.error('Admin update user failed:', err);
        res.status(500).json({message: 'Server error'});
    }
});

// PUT: Toggle lock
router.put('/users/:id/lock', jwtAuth, ensureAdmin, async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id).select('isLocked');
        if (!user) return res.status(404).json({message: 'User not found'});

        user.isLocked = !user.isLocked;
        await user.save();

        res.json({message: `User ${user.isLocked ? 'locked' : 'unlocked'} successfully`, isLocked: user.isLocked});
    } catch (err) {
        console.error('Toggle lock error:', err);
        res.status(500).json({message: 'Server error'});
    }
});

// DELETE: User
router.delete('/users/:id', jwtAuth, ensureAdmin, async (req, res) => {
    try {
        const {id} = req.params;
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({message: 'User not found.'});
        res.json({success: true});
    } catch (err) {
        console.error('Admin delete user failed:', err);
        res.status(500).json({message: 'Server error'});
    }
});

// -------------------------- METRICS --------------------------
router.get('/metrics', jwtAuth, ensureAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const usersCreatedThisMonth = await User.countDocuments({
            createdAt: {$gte: startOfMonth}
        });

        res.json({
            totalUsers,
            usersCreatedThisMonth,
        });
    } catch (err) {
        console.error('Admin metrics error:', err);
        res.status(500).json({message: 'Failed to fetch metrics'});
    }
});

/* -------------------------- POSTS -------------------------- */

router.post('/posts', jwtAuth, ensureAdmin, createPost);
router.put('/posts/:id', jwtAuth, ensureAdmin, updatePost);
router.delete('/posts/:id', jwtAuth, ensureAdmin, deletePost);
router.get('/posts', jwtAuth, ensureAdmin, getAllPosts);
router.get('/posts/:slug', jwtAuth, ensureAdmin, getAdminPostBySlug);

/* -------------------------- SUBMISSIONS -------------------------- */

router.get('/submissions', jwtAuth, ensureAdmin, async (req, res) => {
    try {
        let {search = '', sortField = 'createdAt', sortOrder = 'desc'} = req.query;

        if (sortField === 'submittedAt') sortField = 'createdAt';

        const query = search
            ? {
                $or: [
                    {name: {$regex: search, $options: 'i'}},
                    {message: {$regex: search, $options: 'i'}},
                    {email: {$regex: search, $options: 'i'}},
                ],
            }
            : {};
        const sort = {[sortField]: sortOrder === 'asc' ? 1 : -1};
        const data = await Submission.find(query).sort(sort);
        res.json(data);
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({message: 'Error fetching submissions'});
    }
});

router.delete('/submissions/:id', jwtAuth, ensureAdmin, async (req, res) => {
    try {
        await Submission.findByIdAndDelete(req.params.id);
        res.json({message: 'Deleted'});
    } catch (err) {
        res.status(400).json({message: 'Delete failed'});
    }
});

/* -------------------------- BREED MANAGEMENT -------------------------- */
// GET all breeds (admin view, includes IDs)
/* -------------------------- BREED MANAGEMENT -------------------------- */

// GET all breeds (admin view, with pagination, sort, search)
router.get('/breeds', jwtAuth, ensureAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, parseInt(req.query.limit, 10) || 10);
        const search = (req.query.search || '').trim();
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // default asc

        const query = search ? {name: new RegExp(search, 'i')} : {};

        const [breeds, total] = await Promise.all([
            Breed.find(query)
                .sort({name: sortOrder})
                .skip((page - 1) * limit)
                .limit(limit),
            Breed.countDocuments(query),
        ]);

        res.json({
            breeds,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error('Admin failed to fetch breeds:', err);
        res.status(500).json({message: 'Server error'});
    }
});

// POST new breed (admin-only)
router.post('/breeds', jwtAuth, ensureAdmin, async (req, res) => {
    try {
        const {name} = req.body;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({message: 'Breed name is required'});
        }

        // check if breed already exists (case-insensitive)
        const existing = await Breed.findOne({name: new RegExp(`^${name}$`, 'i')});
        if (existing) {
            return res.status(409).json({message: 'Breed already exists'});
        }


        const newBreed = new Breed({name: name.trim()});
        await newBreed.save();

        res.status(201).json({
            message: 'Breed added successfully',
            breed: newBreed,
        });
    } catch (err) {
        console.error('Error adding breed:', err);
        res.status(500).json({message: 'Server error'});
    }
});


// DELETE breed (admin-only)
router.delete('/breeds/:id', jwtAuth, ensureAdmin, async (req, res) => {
    try {
        const deleted = await Breed.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({message: 'Breed not found'});
        res.json({message: 'Breed deleted successfully'});
    } catch (err) {
        console.error('Error deleting breed:', err);
        res.status(500).json({message: 'Server error'});
    }
});


module.exports = router;
