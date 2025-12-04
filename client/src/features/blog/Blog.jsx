/**
 * @file Blog.jsx
 * @description Displays a list of blog posts with optional tag-based filtering.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../../services/postApi';
import TagSearchBar from './TagSearchBar';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    getAllPosts()
      .then((data) => {
        // Ensure we only keep arrays
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.posts)
          ? data.posts
          : [];

        setPosts(list);

        // Build unique tag set safely
        const tagSet = new Set();
        list.forEach((post) => {
          (post?.tags ?? []).forEach((tagStr) => {
            if (typeof tagStr === 'string') {
              tagStr
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
                .forEach((t) => tagSet.add(t));
            }
          });
        });

        setAllTags([...tagSet]);
      })
      .catch((err) => {
        console.error('Failed to load posts:', err);
        setPosts([]); // keep UI stable
        setAllTags([]);
      });
  }, []);

  // Filter posts based on selected tag (guard for non-array)
  const filteredPosts = Array.isArray(posts)
    ? selectedTag
      ? posts.filter((post) => {
          const tagList = (post?.tags ?? []).flatMap((tagStr) =>
            typeof tagStr === 'string'
              ? tagStr.split(',').map((t) => t.trim())
              : []
          );
          return tagList.includes(selectedTag);
        })
      : posts
    : [];

  return (
    <div className="container mt-4">
      <h1>Blog</h1>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <TagSearchBar
          tags={allTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />
      )}

      {filteredPosts.length === 0 ? (
        <p>No posts found{selectedTag ? ` for tag "${selectedTag}"` : ''}.</p>
      ) : (
        <ul className="list-unstyled">
          {filteredPosts.map((post) => (
            <li key={post?._id ?? post?.slug} className="mb-4">
              <Link to={`/blog/${post?.slug}`}>
                <h3>{post?.title ?? 'Untitled Post'}</h3>
              </Link>
              <small className="text-muted d-block">
                {post?.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : ''}
              </small>

              {/* Tags */}
              {(post?.tags?.length ?? 0) > 0 && (
                <div className="mt-1">
                  {(post.tags ?? [])
                    .flatMap((tagStr) =>
                      typeof tagStr === 'string'
                        ? tagStr.split(',').map((t) => t.trim())
                        : []
                    )
                    .filter(Boolean)
                    .map((tag, i) => (
                      <span key={`${post._id ?? i}-${tag}`} className="badge bg-secondary me-1">
                        #{tag}
                      </span>
                    ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Blog;
