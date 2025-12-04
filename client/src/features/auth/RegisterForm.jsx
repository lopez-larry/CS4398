/**
 * @file RegisterForm.jsx
 * @description Component for user sign-up in the SPA PAM project.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';
import { toast } from 'react-toastify';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isStrongPassword(password)) {
      toast.error(
        'Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
      );
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/user/public-register', {
        username: username.trim(),
        email: email.trim(),
        password,
        consent: { agreed: consentChecked },
      });

      // Save email for verification step
      localStorage.setItem('pendingEmail', email.trim());

      toast.success('Registration successful. Please check your email to verify.');
      navigate('/verify-required');
    } catch (err) {
      console.error('Registration error:', err);
      const serverMessage = err.response?.data?.message;
      const friendlyMessage =
        serverMessage ||
        'Registration failed. Please ensure all fields are correct and try again.';
      setError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Register</h2>
      <small className="form-text text-muted mb-2">
        Username must be 3–30 characters using only letters, numbers, underscores (_) or dashes (-).
      </small>

      <input
        type="text"
        placeholder="Username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="form-control mb-2"
      />

      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="form-control mb-2"
      />

      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="form-control mb-3"
      />

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="consentCheck"
          required
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="consentCheck">
          I agree to the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>
        </label>
      </div>

      <button type="submit" className="btn btn-success w-100" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>

      {error && <p className="text-danger mt-3">{error}</p>}
    </form>
  );
};

export default RegisterForm;
