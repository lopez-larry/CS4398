// pages/UnderConstruction.jsx
import React from "react";
import { Link } from "react-router-dom";

const UnderConstruction = () => {
  return (
    <div className="text-center my-5">
      <h1 className="fw-bold mb-3">This Page Is Under Construction</h1>
      <p className="mb-4">We’re working hard to bring this feature online. Check back soon!</p>
      <Link to="/" className="btn btn-primary">
        Return Home
      </Link>
    </div>
  );
};

export default UnderConstruction;
