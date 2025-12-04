/**
 * @file TagSearchBar.jsx
 * @description Reusable component for filtering blog posts by tag.
 */

import React from 'react';

const TagSearchBar = ({ tags, selectedTag, onSelectTag }) => {
  // Normalize tags: ensure it's a flat array of tag strings
  const normalizedTags = Array.isArray(tags)
    ? tags.flatMap(tag =>
        typeof tag === 'string'
          ? tag.split(',').map(t => t.trim())
          : []
      )
    : [];

  // Remove duplicates
  const uniqueTags = [...new Set(normalizedTags)];

  if (!uniqueTags.length) return null;

  return (
    <div className="mb-4">
      <strong>Filter by Tag:</strong>{' '}
      {uniqueTags.map((tag, i) => (
        <button
          key={i}
          className={`btn btn-sm me-2 mb-2 ${
            selectedTag === tag ? 'btn-primary' : 'btn-outline-primary'
          }`}
          onClick={() => onSelectTag(tag)}
        >
          #{tag}
        </button>
      ))}
      {selectedTag && (
        <button
          className="btn btn-sm btn-link text-danger"
          onClick={() => onSelectTag(null)}
        >
          Clear Filter
        </button>
      )}
    </div>
  );
};

export default TagSearchBar;
