import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostBySlug } from '../../services/postApi';
import ReactMarkdown from 'react-markdown';


const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    getPostBySlug(slug).then(setPost).catch(console.error);
  }, [slug]);

  if (!post) return <p>Loading post...</p>;

  return (
    <div className="container">
      <h1>{post.title}</h1>
      <p><em>{new Date(post.createdAt).toLocaleDateString()}</em></p>

      <ReactMarkdown>{post.content}</ReactMarkdown>
    </div>
  );
};

export default BlogPost;
