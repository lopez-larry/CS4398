/**
 * @file Navbar.jsx
 * @description Site navigation. Dynamically updates dropdowns based on user role (admin, breeder, customer).
 */

import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../src/context/AuthContext';
import axios from '../../../src/axiosInstance';
import pamLogo from "../../../src/components/layout/pamLogo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const role = String(user?.role || '').toLowerCase();
  const isAdmin = role === 'admin';
  const isBreeder = role === 'breeder';
  const isCustomer = role === 'customer';

  const handleLogout = async (e) => {
    e?.preventDefault?.();
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await axios.post('/user/logout');
      await logout();
      navigate('/');
    } catch {
      await logout();
      navigate('/');
    } finally {
      setLoggingOut(false);
    }
  };

  const renderRoleDropdown = () => {
    if (!user) return null;

    const displayName = user?.firstName || user?.username || 'Account';

    if (isBreeder) {
      return (
        <li className="nav-item dropdown">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            id="breederDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {displayName}
          </a>
          <ul className="dropdown-menu" aria-labelledby="breederDropdown">
            <li><NavLink to="/breeder" className="dropdown-item">Dashboard</NavLink></li>
            <li><NavLink to="/breeder/dogs/new" className="dropdown-item">New Dog</NavLink></li>
            <li><NavLink to="/profile" className="dropdown-item">Profile</NavLink></li>
          </ul>
        </li>
      );
    }

    if (isCustomer) {
      return (
        <li className="nav-item dropdown">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            id="customerDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {displayName}
          </a>
          <ul className="dropdown-menu" aria-labelledby="customerDropdown">
            <li><NavLink to="/customer" className="dropdown-item">Dashboard</NavLink></li>
            <li><NavLink to="/profile" className="dropdown-item">Profile</NavLink></li>
          </ul>
        </li>
      );
    }

    if (isAdmin) {
      return (
        <li className="nav-item dropdown">
          <a
            className="nav-link dropdown-toggle"
            href="#"
            id="adminDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Admin
          </a>
          <ul className="dropdown-menu" aria-labelledby="adminDropdown">
            <li><NavLink to="/admin/users" className="dropdown-item">Manage Users</NavLink></li>
            <li><NavLink to="/admin/dashboard" className="dropdown-item">Metrics Dashboard</NavLink></li>
            <li><NavLink to="/admin/posts/new" className="dropdown-item">New Post</NavLink></li>
            <li><NavLink to="/admin/posts" className="dropdown-item">Post List</NavLink></li>
            <li><NavLink to="/profile" className="dropdown-item">Profile</NavLink></li>
          </ul>
        </li>
      );
    }

    return (
      <li className="nav-item">
        <NavLink to="/profile" className="nav-link">
          {displayName}
        </NavLink>
      </li>
    );
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold">
          <img src={pamLogo} alt="Pam Logo" height="100" className="me-2" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">

            {!user && (
              <>
                <li className="nav-item"><NavLink to="/" className="nav-link">Home</NavLink></li>
                <li className="nav-item"><NavLink to="/about" className="nav-link">About</NavLink></li>
                <li className="nav-item"><NavLink to="/blog" className="nav-link">Blog</NavLink></li>
                <li className="nav-item"><NavLink to="/breeders" className="nav-link">Breeders</NavLink></li>
                <li className="nav-item"><NavLink to="/login" className="nav-link">Login</NavLink></li>
                <li className="nav-item"><NavLink to="/register" className="nav-link">Register</NavLink></li>
              </>
            )}

            {user && (
              <>
                <li className="nav-item"><NavLink to="/blog" className="nav-link">Blog</NavLink></li>
                <li className="nav-item"><NavLink to="/dogs" className="nav-link">Puppies</NavLink></li>
                <li className="nav-item"><NavLink to="/breeders" className="nav-link">Breeders</NavLink></li>

                {renderRoleDropdown()}

                <li className="nav-item ms-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn btn-sm btn-outline-danger"
                    disabled={loggingOut}
                  >
                    {loggingOut ? 'Logging out…' : 'Logout'}
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
