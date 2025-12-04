/**
 * @file PrivacyPolicy.jsx
 * @description Privacy Policy for SPA-PAM (breeder–customer dog matching platform),
 *              updated to include an About Us -> Contact Form hyperlink.
 */

import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="container-left mt-4">
      <h1>Privacy Policy</h1>
      <h4 className="mb-5">v1.0</h4>

      <p>
        At <strong>SPA-PAM</strong>, we are committed to protecting your privacy.
        This Privacy Policy explains what information we collect, how we use it,
        and the choices you have regarding your data.
      </p>

      <h3>1. Information We Collect</h3>
      <ul>
        <li><strong>Account Information:</strong> name, email, role, password (hashed).</li>
        <li><strong>Breeder Profile Data:</strong> kennel name, website, phone, city, state.</li>
        <li><strong>Dog Listings:</strong> images, breed, age, visibility, descriptions.</li>
        <li><strong>Messages:</strong> breeder–customer conversations.</li>
        <li><strong>Technical Data:</strong> IP address, device data, login timestamps.</li>
        <li><strong>Favorites:</strong> dogs you bookmark.</li>
        <li><strong>Consent Logs:</strong> consent version, IP, timestamp.</li>
      </ul>

      <h3>2. How We Use Your Information</h3>
      <ul>
        <li>Provide core platform functionality</li>
        <li>Display dog listings and breeder profiles</li>
        <li>Enable messaging between breeders and customers</li>
        <li>Improve platform performance and user experience</li>
        <li>Maintain account security and detect fraud</li>
        <li>Comply with legal obligations</li>
      </ul>

      <p>
        We do <strong>not</strong> sell or rent your personal data to third parties.
      </p>

      <h3>3. Dog Photos & Media (S3 Storage)</h3>
      <p>
        SPA-PAM stores images on AWS S3. Images are private by default and accessed
        only through secure signed URLs. You retain ownership of all photos you upload.
      </p>

      <h3>4. Messaging Privacy</h3>
      <p>
        Messages are stored securely and seen only by the communicating parties.
        SPA-PAM may review messages <strong>only</strong> when investigating abuse,
        legal issues, or safety concerns.
      </p>

      <h3>5. Cookies & Authentication</h3>
      <p>We use cookies and local storage for:</p>
      <ul>
        <li>Secure login sessions (JWT token)</li>
        <li>Consent tracking</li>
        <li>User preferences</li>
      </ul>

      <h3>6. Third-Party Services</h3>
      <p>We may use trusted third-party tools for:</p>
      <ul>
        <li>Image storage (AWS S3)</li>
        <li>Basic, non-identifying analytics</li>
        <li>Email delivery (if enabled)</li>
      </ul>

      <h3>7. Children’s Privacy</h3>
      <p>
        SPA-PAM is not intended for individuals under the age of 13. We do not
        knowingly collect data from minors.
      </p>

      <h3>8. Your Rights</h3>
      <p>You may request to:</p>
      <ul>
        <li>Access your data</li>
        <li>Update or correct your data</li>
        <li>Delete your account</li>
        <li>Withdraw consent</li>
      </ul>

      <h3>9. Data Security</h3>
      <p>
        We use industry-standard security measures, including HTTPS encryption,
        hashed passwords, role-based access controls, and restricted media access.
      </p>

      <h3>10. Changes to This Privacy Policy</h3>
      <p>
        We may update this policy periodically. Continued use of the platform
        constitutes acceptance of the updated terms.
      </p>

      <h3>11. Contact Us</h3>
      <p>
        If you have questions about this Privacy Policy or wish to exercise your
        data rights, please visit our{" "}
        <Link to="/about">
          About Us
        </Link>{" "}
        page, which includes our contact form.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
