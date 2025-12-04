/**
 * @file postApi.js
 * @description API service for blog posts (public + admin).
 */

import axios from '../axiosInstance.js';

const API = '/posts'; // resolves to /api/posts via axios baseURL

/* ------------------------- Public (read) ------------------------- */

// Paginated list of published posts
export const getPostsPage = async ({ page = 1, limit = 10 } = {}) => {
  const res = await axios.get(API, { params: { page, limit } });
  // Normalize in case backend ever returns an array
  if (Array.isArray(res.data)) {
    return { items: res.data, page, limit, total: res.data.length, pages: 1 };
  }
  return {
    items: res.data.items ?? [],
    page: res.data.page ?? page,
    limit: res.data.limit ?? limit,
    total: res.data.total ?? 0,
    pages: res.data.pages ?? 1,
  };
};

// Convenience: just the items
export const getAllPosts = async (opts = {}) => {
  const { items } = await getPostsPage(opts);
  return items;
};

// Single published post by slug
export const getPostBySlug = async (slug) => {
  const res = await axios.get(`${API}/${slug}`);
  return res.data;
};

/* ------------------------- Admin (write + read) ------------------------- */

// Create new post (admin-only; backend expects POST /api/posts)
export const createPost = async (postData) => {
  const res = await axios.post(API, postData);
  return res.data;
};

// Update post by id (admin-only; PUT /api/posts/:id)
export const updatePost = async (id, postData) => {
  const res = await axios.put(`${API}/${id}`, postData);
  return res.data;
};

// Delete post by id (admin-only; DELETE /api/posts/:id)
export const deletePost = async (id) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
};

// Toggle publish status (admin-only; PUT /api/posts/:id)
export const togglePublishStatus = async (id, isPublished) => {
  const res = await axios.put(`${API}/${id}`, { isPublished });
  return res.data;
};

/* ------------------------- Admin (read) ------------------------- */

// Admin read: list ALL posts (draft + published) -> GET /api/admin/posts
export const getAllAdminPosts = async () => {
  const res = await axios.get(`/admin/posts`);
  // backend returns paginated object, normalize to array
  if (Array.isArray(res.data)) return res.data;
  return res.data.items ?? [];
};

// Admin read: single post by slug (draft or published) -> GET /api/admin/posts/:slug
export const getAdminPostBySlug = async (slug) => {
  const res = await axios.get(`/admin/posts/${slug}`);
  return res.data;
};
