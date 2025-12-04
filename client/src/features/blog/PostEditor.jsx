/**
 * @file PostEditor.jsx
 * @description Form for creating or editing blog posts (admin only).
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPost, updatePost, getPostBySlug } from '../../services/postApi';

const PostEditor = ({ isEdit = false }) => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [slugValue, setSlugValue] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing post for edit
  useEffect(() => {
    if (isEdit && slug) {
      getPostBySlug(slug).then((post) => {
        setTitle(post.title || '');
        setSlugValue(post.slug || '');
        setContent(post.content || '');
        setTags((post.tags || []).join(', '));
      });
    }
  }, [isEdit, slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const postData = {
      title,
      slug: slugValue,
      content,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (isEdit && slug) {
        await updatePost(postData._id, postData);
      } else {
        await createPost(postData);
      }
      navigate('/admin/posts');
    } catch (err) {
      console.error('Failed to save post:', err);
      alert('Error saving post. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{isEdit ? 'Edit Post' : 'New Post'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Slug</label>
          <input
            type="text"
            className="form-control"
            value={slugValue}
            onChange={(e) => setSlugValue(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Content</label>
          <textarea
            className="form-control"
            rows="6"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            className="form-control"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default PostEditor;