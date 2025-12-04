/**
 * @file App.jsx
 * @description Main app routes for the MERN Starter Pack (with CustomerDashboard integration)
 */

import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import About from "./pages/About";

import Blog from "./features/blog/Blog";
import BlogPost from "./features/blog/BlogPost";

import AdminPostList from "./features/admin/AdminPostList";
import AdminPostForm from "./features/admin/AdminPostForm";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import DashboardAdmin from "./pages/DashboardAdmin";

import Profile from "./features/user/Profile";
import DogGrid from "./pages/DogGrid";
import DogDetail from "./features/dog/DogDetail";

import DashboardBreeder from "./pages/DashboardBreeder";
import DashboardCustomer from "./pages/DashboardCustomer";

import DogForm from "./features/dog/DogForm";
import ContactBreederForm from "./features/messages/ContactBreederForm";
import BreedersPage from "./pages/BreedersPage";

import LoginForm from "./features/auth/LoginForm";
import RegisterForm from "./features/auth/RegisterForm";
import ForgotPassword from "./features/auth/ForgotPassword";
import ResetPassword from "./features/auth/ResetPassword";
import ChangePassword from "./features/user/ChangePassword";
import VerifyEmail from "./features/auth/VerifyEmail";
import Logout from "./features/auth/Logout";
import EmailNotVerified from "./features/auth/EmailNotVerified";

import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsOfService from "./components/legal/TermsOfService";

import CookieViewer from "./components/debug/CookieViewer";

import PrivateRoute from "./features/auth/routes/PrivateRoute";
import VerifiedRoute from "./features/auth/routes/VerifiedRoute";
import AdminRoute from "./features/admin/routes/AdminRoute";

import { useAuth } from "./context/AuthContext";

import UnderConstruction from "./pages/UnderConstruction";

const App = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    const updateActivity = () =>
      localStorage.setItem("lastActivity", Date.now());
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    updateActivity();
    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const warningThreshold = 60000;
    const timeoutLimit = 10 * 60 * 1000;
    let warned = false;

    const timer = setInterval(() => {
      const lastActivity =
        parseInt(localStorage.getItem("lastActivity"), 10) || Date.now();
      const now = Date.now();
      const timeLeft = timeoutLimit - (now - lastActivity);

      if (timeLeft <= 0) {
        logout();
        warned = false;
      } else if (timeLeft <= warningThreshold && !warned) {
        toast.warn("You will be logged out soon due to inactivity.", {
          autoClose: false,
        });
        warned = true;
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [user, logout]);

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <div className="container mt-4">
          <Routes>

            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            {/* Under Construction Routes */}
            <Route path="/under-construction" element={<UnderConstruction />} />
            <Route path="/cats" element={<UnderConstruction />} />
            <Route path="/animals" element={<UnderConstruction />} />

            {/* Blog */}
            <Route path="/blog" element={<VerifiedRoute><Blog /></VerifiedRoute>} />
            <Route path="/blog/:slug" element={<VerifiedRoute><BlogPost /></VerifiedRoute>} />

            {/* Dogs */}
            <Route path="/dogs" element={<DogGrid />} />
            <Route path="/dogs/:id" element={<DogDetail />} />

            {/* Customer */}
            <Route path="/customer" element={<PrivateRoute><DashboardCustomer /></PrivateRoute>} />
            <Route path="/customer/saved-dogs" element={<PrivateRoute><DashboardCustomer /></PrivateRoute>} />

            {/* Breeder */}
            <Route path="/breeder" element={<PrivateRoute><DashboardBreeder /></PrivateRoute>} />
            <Route path="/breeder/dogs/new" element={<PrivateRoute><DogForm /></PrivateRoute>} />
            <Route path="/breeder/dogs/edit/:id" element={<PrivateRoute><DogForm /></PrivateRoute>} />

            {/* Messaging */}
            <Route path="/dogs/:id/contact" element={<ContactBreederForm />} />
            <Route path="/breeders" element={<BreedersPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><DashboardAdmin /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            <Route path="/admin/posts" element={<AdminRoute><AdminPostList /></AdminRoute>} />
            <Route path="/admin/posts/new" element={<AdminRoute><AdminPostForm /></AdminRoute>} />
            <Route path="/admin/posts/edit/:slug" element={<AdminRoute><AdminPostForm /></AdminRoute>} />

            {/* Profile */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Auth */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/verify-required" element={<EmailNotVerified />} />
            <Route path="/logout" element={<Logout />} />

            {/* Legal */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            {/* Debug */}
            <Route path="/debug/cookies-ui" element={<PrivateRoute>
              {user?.role === "admin" ? <CookieViewer /> : <h1>403 - Forbidden</h1>}
            </PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />

          </Routes>
        </div>
      </main>

      <Footer />
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default App;
