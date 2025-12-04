/**
 * @file BreedersPage.jsx
 * @description Wrapper page that displays the BreederList component.
 */

import React from "react";
import BreederList from "../features/breeders/BreederList";

const BreedersPage = () => {
  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        Meet Your Trusted Breeders
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Verified Ethical Breeder’s Statement
      </p>

      <BreederList />
    </div>
  );
};

export default BreedersPage;
