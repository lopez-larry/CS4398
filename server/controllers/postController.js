/**
 * @file postController.js
 * @description Blog post CRUD for Starter Pack (admin-managed).
 */

const Post = require('../models/Post');

// Helpers
const toSlug = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// GET /api/posts  (public, only published)  ?page=&limit=&tag=&q=
exports.getAllPublishedPosts = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const skip  = (page - 1) * limit;

    const filters = { isPublished: true };
    if (req.query.tag) filters.tags = req.query.tag;
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filters.$or = [
        { title:   { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags:    { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Post.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(filters),
    ]);

    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getAllPublishedPosts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// GET /api/posts/:slug  (public, only published)
exports.getPostBySlug = async (req, res) => {
  const raw = req.params.slug;
  const slug = typeof raw === 'string' ? toSlug(raw) : '';
  if (!slug) return res.status(400).json({ error: 'Invalid post slug' });

  try {
    const post = await Post.findOne({ slug, isPublished: true }).lean();
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('getPostBySlug error:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// POST /api/posts  (admin only)
exports.createPost = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { title, slug: slugInput, content = '', tags = [], isPublished = false } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const slug = toSlug(slugInput || title);
    if (!slug) return res.status(400).json({ error: 'Invalid slug' });

    const exists = await Post.findOne({ slug }).lean();
    if (exists) return res.status(409).json({ error: 'Slug already in use' });

    const newPost = await Post.create({
      title: title.trim(),
      slug,
      content,
      tags,
      isPublished: !!isPublished,
      author: req.user._id,
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error('createPost error:', err);
    res.status(400).json({ error: 'Failed to create post', details: err.message });
  }
};

// PUT /api/posts/:id  (admin or author)
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isAdmin = req.user?.role === 'admin';
    const isAuthor = post.author?.equals?.(req.user._id);
    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ error: 'Not authorized to modify this post' });
    }

    const { title, slug: slugInput, content, tags, isPublished } = req.body;

    if (title !== undefined) post.title = String(title).trim() || post.title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : post.tags;
    if (isPublished !== undefined) post.isPublished = !!isPublished;

    if (slugInput !== undefined || title !== undefined) {
      const nextSlug = toSlug(slugInput || post.title);
      if (!nextSlug) return res.status(400).json({ error: 'Invalid slug' });

      if (nextSlug !== post.slug) {
        const taken = await Post.findOne({ slug: nextSlug, _id: { $ne: post._id } }).lean();
        if (taken) return res.status(409).json({ error: 'Slug already in use' });
        post.slug = nextSlug;
      }
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error('updatePost error:', err);
    res.status(400).json({ error: 'Failed to update post', details: err.message });
  }
};

// DELETE /api/posts/:id  (admin or author)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isAdmin = req.user?.role === 'admin';
    const isAuthor = post.author?.equals?.(req.user._id);
    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Admin: GET /api/admin/posts  (admin only; includes drafts)
exports.getAllPosts = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const page  = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip  = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Post.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments({}),
    ]);

    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getAllPosts (admin) error:', err);
    res.status(500).json({ error: 'Failed to fetch all posts' });
  }
};

// Admin: GET /api/admin/posts/:slug (draft or published)
exports.getAdminPostBySlug = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    const slug = toSlug(req.params.slug);
    if (!slug) return res.status(400).json({ error: 'Invalid slug' });

    const post = await Post.findOne({ slug }).lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (err) {
    console.error('getAdminPostBySlug error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
