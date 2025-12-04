/**
 * @file About.jsx
 * @description Displays app info with photo placeholder and a submission form.
 */

import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';

const About = () => {
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    email: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Optional email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      await axiosInstance.post('/public/feedback', formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <section>
        <h1>About Us</h1>
        <img
          src="https://via.placeholder.com/200"
          alt="Placeholder"
          style={{
            width: '200px',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
        <p className="mt-4">
          Welcome — this full-stack application highlights my software engineering capabilities.
        </p>
      </section>

      <section className="mt-8">
        <h2>Leave Us a Message</h2>
        {submitted ? (
          <p className="text-success">Thanks for your feedback!</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Name</label>
              <input
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Email (optional)</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label>Message</label>
              <textarea
                name="message"
                className="form-control"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        )}
      </section>
    </main>
  );
};

export default About;
