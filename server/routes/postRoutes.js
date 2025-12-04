/**
 * @file postRoutes.js
 * @description Routes for blog post CRUD operations.
 *
 * Policy:
 *  - Public READ: list published posts, view by slug
 *  - Admin-only WRITE: create, update, delete
 *
 * Note:
 *  Order matters in Express. Admin routes must be declared
 *  BEFORE the catch-all '/:slug' route to avoid greedy matches.
 */

const express = require('express');
const router = express.Router();

const { ensureAdmin } = require('../middleware/authMiddleware');
const jwtAuth = require('../middleware/jwtAuth');

const {
  createPost,
  updatePost,
  deletePost,
  getAllPublishedPosts, // public: only published
  getPostBySlug,        // public: detail by slug (published)
  getAllPosts,          // admin: all posts
  getAdminPostBySlug,   // admin: draft or published
} = require('../controllers/postController');

// ---------- Admin-only routes (placed BEFORE the catch-all '/:slug') ----------
router.post('/',     jwtAuth, ensureAdmin, createPost);
router.put('/:id',   jwtAuth, ensureAdmin, updatePost);
router.delete('/:id', jwtAuth, ensureAdmin, deletePost);

// Admin read routes
router.get('/admin/all',   jwtAuth, ensureAdmin, getAllPosts);
router.get('/admin/:slug', jwtAuth, ensureAdmin, getAdminPostBySlug);

// ------------------------ Public read-only routes -------------------------
router.get('/', getAllPublishedPosts);
router.get('/:slug', getPostBySlug);

module.exports = router;
