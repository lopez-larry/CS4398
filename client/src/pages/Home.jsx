/**
 * @file Home.jsx
 * @description Landing page with full-width hero cards for Dogs, Cats, and Breeder Showcase.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../axiosInstance";
import { toast } from "react-toastify";

const Home = () => {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();

  const isAdmin = role === "admin";
  const isBreeder = role === "breeder";
  const isCustomer = role === "customer";

  const showJoinSection = !user;

  const [query, setQuery] = useState("");
  const navigate = useNavigate();

const handleSearch = async () => {
  const trimmed = query.trim();

  // If empty → go to dogs page normally
  if (!trimmed) {
    navigate("/dogs");
    return;
  }

  try {
    // Check if results exist before navigating
    const res = await axios.get("/dogs", {
      params: { search: trimmed }
    });

    const count = res.data?.data?.length || 0;

    if (count === 0) {
      toast.info(`No "${trimmed}'s" right now. Showing all available dogs.`);
      navigate("/dogs"); // route to puppies page
    } else {
      navigate(`/dogs?search=${encodeURIComponent(trimmed)}`);
    }

  } catch (err) {
    console.error(err);
    toast.error("Search failed. Please try again.");
  }
};


  return (
    <div className="home">

      {/* Search bar */}
      <section className="search-section py-4 text-center bg-light shadow-sm">
        <div className="container d-flex justify-content-center align-items-center gap-2">
          <input
            type="text"
            className="form-control w-50"
            placeholder="Search for pets, breeders, or breeds..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </div>
      </section>

      {/* Homepage image */}
      <section className="hero-banner my-4 text-center">
        <img
          src="/Dogs/HomepagePhoto.webp"
          alt="Pets Banner"
          className="img-fluid rounded shadow-lg"
          style={{ maxHeight: "500px", objectFit: "cover", objectPosition:"top", width: "90%", maxWidth: "1000px" }}
        />
      </section>

      {/* Join Our Community Section */}
      {showJoinSection && (
        <section className="cta-section text-center my-5">
          <h2 className="mb-4 fw-bold">Join Our Pet Community</h2>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link to="/register-buyer" className="btn btn-success btn-lg">
              Sign Up as Buyer
            </Link>
            <Link to="/animals" className="btn btn-outline-secondary btn-lg">
              Browse Animals
            </Link>
            <Link to="/register-breeder" className="btn btn-warning btn-lg">
              Sign Up as Breeder
            </Link>
          </div>
        </section>
      )}

      {/* Cards */}
      <section className="container my-5">
        <div className="row text-center g-4">
          <div className="col-md-4">
            <Link to="/dogs" className="card card-hero text-white">
              <img src="/Dogs/DACH PUPS.jpg" className="card-img" alt="Dogs" />
              <div className="card-img-overlay d-flex flex-column justify-content-center">
                <h2 className="card-title display-5 fw-bold">Dogs</h2>
              </div>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/cats" className="card card-hero text-white">
              <img src="/Cats/CATCARD.jpg" className="card-img" alt="Cats" />
              <div className="card-img-overlay d-flex flex-column justify-content-center">
                <h2 className="card-title display-5 fw-bold">Cats</h2>
              </div>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/breeders" className="card card-hero text-white">
              <img src="/Dogs/BreederShowcase.jpg" className="card-img" alt="Breeder Showcase" />
              <div className="card-img-overlay d-flex flex-column justify-content-center">
                <h2 className="card-title display-5 fw-bold">Breeder Showcase</h2>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us py-5 text-light text-center">
        <div className="container">
          <h2 className="fw-bold mb-4 text-black">Why Choose Us?</h2>
          <p className="mb-5 lead text-black">
            We’re more than just a pet marketplace, we’re a community that connects trusted breeders, caring buyers, and happy pets.
          </p>

          <div className="row g-4 justify-content-center">
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card bg-transparent border-light h-100 p-4">
                <i className="bi bi-shield-check display-4 mb-3 text-warning"></i>
                <h4 className="fw-bold">Verified Breeders</h4>
                <p className="text-black">
                  Every breeder is screened and verified to ensure your future pet comes from a safe and ethical environment.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-transparent border-light h-100 p-4">
                <i className="bi bi-heart display-4 mb-3 text-danger"></i>
                <h4 className="fw-bold">Healthy Pets</h4>
                <p className="text-black">
                  We prioritize health and happiness connecting you only with pets raised with care and love.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-transparent border-light h-100 p-4">
                <i className="bi bi-people display-4 mb-3 text-info"></i>
                <h4 className="fw-bold">Community Support</h4>
                <p className="text-black">
                  Join a supportive community of breeders and owners, sharing advice, resources, and heartwarming stories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-5 bg-light text-dark">
        <div className="container" style={{ maxWidth: "900px" }}>
          <h2 className="fw-bold text-center mb-5">What Our Community Says</h2>
          <p className="text-center text-muted mb-5">Verified feedback from happy pet owners and breeders.</p>

          <div className="d-flex flex-column gap-4">
            <div className="card testimonial-card shadow-sm p-4">
              <p className="fst-italic mb-3">"I found my puppy here and the breeder was trustworthy and helpful throughout the process!"</p>
              <h5 className="fw-bold mb-0">— Emily R.</h5>
              <small className="text-muted">Verified Buyer</small>
            </div>

            <div className="card testimonial-card shadow-sm p-4">
              <p className="fst-italic mb-3">"The platform made it easy to showcase my cats, and I love the community support."</p>
              <h5 className="fw-bold mb-0">— John B.</h5>
              <small className="text-muted">Breeder</small>
            </div>

            <div className="card testimonial-card shadow-sm p-4">
              <p className="fst-italic mb-3">"I always recommend this site to my friends looking for a new pet — safe, reliable, and friendly."</p>
              <h5 className="fw-bold mb-0">— Sarah K.</h5>
              <small className="text-muted">Verified Buyer</small>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
