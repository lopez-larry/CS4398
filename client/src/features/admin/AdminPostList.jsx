/**
 * @file AdminPostList.jsx
 * @description Admin dashboard for listing, editing, publishing, and deleting blog posts.
 */

import React, { useEffect, useState } from 'react';
import { getAllAdminPosts, deletePost, togglePublishStatus } from '../../services/postApi';
import { useNavigate } from 'react-router-dom';

const AdminPostList = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllAdminPosts()
      .then((data) => {
        console.log("Admin posts API response:", data);
        setPosts(data);
      })
      .catch((err) => {
        console.error("Error fetching admin posts:", err);
        setPosts([]); // prevent crash on error
      });
  }, []);

  const handleEdit = (slug) => navigate(`/admin/posts/edit/${slug}`);

  const handleTogglePublish = async (post) => {
    try {
      const updated = await togglePublishStatus(post._id, !post.isPublished);
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        setPosts((prev) => prev.filter((post) => post._id !== id));
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  return (
    <div className="container">
      <h1 className="mb-4">Manage Posts</h1>
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate('/admin/posts/new')}
      >
        Create New Post
      </button>

      {!Array.isArray(posts) || posts.length === 0 ? (
        <p>{posts?.message || 'No posts found or unauthorized.'}</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id}>
                <td>{post.title}</td>
                <td>{post.slug}</td>
                <td>{post.isPublished ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(post.slug)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger me-2"
                    onClick={() => handleDelete(post._id)}
                  >
                    Delete
                  </button>
                  <button
                    className={`btn btn-sm ${
                      post.isPublished ? 'btn-secondary' : 'btn-success'
                    }`}
                    onClick={() => handleTogglePublish(post)}
                  >
                    {post.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPostList;
