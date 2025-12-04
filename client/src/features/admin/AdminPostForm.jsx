/**
 * @file AdminPostForm.js
 * @description Admin form to create or edit blog posts.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, updatePost, getAdminPostBySlug } from '../../../src/services/postApi';

const AdminPostForm = () => {
  const { slug: routeSlug } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false,
    tags: '', // NEW: for comma-separated string input
  });

  const [postId, setPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load existing post if editing
  useEffect(() => {
    if (routeSlug) {
      setLoading(true);
      getAdminPostBySlug(routeSlug)
        .then((data) => {
          setPostId(data._id);
          setFormData({
            title: data.title || '',
            content: data.content || '',
            published: data.isPublished || false,
            tags: data.tags?.join(', ') || '', // NEW: convert array to comma-separated string
          });
        })
        .catch(() => setError('Failed to load post'))
        .finally(() => setLoading(false));
    }
  }, [routeSlug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const generatedSlug = formData.title.toLowerCase().trim().replace(/\s+/g, '-');

    const postPayload = {
      title: formData.title,
      slug: generatedSlug,
      content: formData.content,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0), // NEW: clean and convert string to array
      isPublished: formData.published,
    };

    try {
      if (routeSlug && postId) {
        await updatePost(postId, postPayload);
      } else {
        await createPost(postPayload);
      }
      navigate('/admin/posts');
    } catch (err) {
      console.error(err);
      setError('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{routeSlug ? 'Edit Post' : 'Create Post'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3 ">
          <label className="form-label">Content</label>
          <textarea
            className="form-control"
            name="content"
            rows="6"
            style={{ height: '600px' }}
            value={formData.content}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Tags (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., SDLC, DevOps, Software Engineering"
          />
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            name="published"
            checked={formData.published}
            onChange={handleChange}
            id="publishedCheck"
          />
          <label className="form-check-label" htmlFor="publishedCheck">
            Publish Now
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : routeSlug ? 'Update Post' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default AdminPostForm;
