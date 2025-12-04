/**
 * @file PostList.jsx
 * @description Displays a list of blog posts with edit/delete options (admin only).
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllAdminPosts, deletePost } from '../../services/postApi';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPosts = async () => {
    try {
      const data = await getAllAdminPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(id);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Error deleting post.');
    }
  };

  if (loading) return <p>Loading posts...</p>;

  return (
    <div className="container mt-4">
      <h2>All Posts</h2>
      <Link to="/admin/posts/new" className="btn btn-primary mb-3">
        New Post
      </Link>
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <ul className="list-group">
          {posts.map((post) => (
            <li key={post._id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">{post.title}</h5>
                <small className="text-muted">{post.slug}</small>
              </div>
              <div>
                <Link to={`/admin/posts/edit/${post.slug}`} className="btn btn-sm btn-outline-secondary me-2">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="btn btn-sm btn-outline-danger"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PostList;