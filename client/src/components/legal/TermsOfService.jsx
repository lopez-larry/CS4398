/**
 * @file TermsOfService.jsx
 * @description Terms of Service for SPA-PAM (breeder–customer dog matching platform).
 *
 * This document outlines:
 *  - Acceptable platform use
 *  - Breeder responsibilities and listing requirements
 *  - Customer responsibilities
 *  - Messaging and safety expectations
 *  - Liability limitations and disclaimers
 *  - Modification and enforcement of terms
 */

import React from 'react';

const TermsOfService = () => {
  return (
    <div className="container-left mt-4">
      <h1>Terms of Service</h1>
        <h4> As of: 12/01/2025</h4><br/>

      <p>
        Welcome to <strong>SPA-PAM</strong>, a platform designed to connect breeders and customers.
        By accessing or using this service, you agree to the following Terms of Service.
        Please review them carefully.
      </p>

      {/* 1 */}
      <h3>1. Platform Purpose</h3>
      <p>
        SPA-PAM provides tools for breeders to list dogs and for customers to view, save,
        and inquire about available dogs. We do not certify, endorse, or guarantee the quality,
        health, or legitimacy of any breeder, listing, or communication on the platform.
      </p>

      {/* 2 */}
      <h3>2. Acceptable Use</h3>
      <p>You agree to use the platform responsibly and to never:</p>
      <ul>
        <li>Provide false, misleading, or incomplete information</li>
        <li>Engage in abusive, threatening, or harassing behavior</li>
        <li>Upload harmful content, malware, or unauthorized scripts</li>
        <li>Attempt to scrape, disrupt, or overload the platform</li>
        <li>Use SPA-PAM for illegal, fraudulent, or unethical activity</li>
      </ul>

      {/* 3 */}
      <h3>3. Breeder Responsibilities</h3>
      <p>If you are a breeder on SPA-PAM, you agree that:</p>
      <ul>
        <li>All dog listings are accurate, truthful, and updated promptly</li>
        <li>You have legal ownership or proper authorization to list each dog</li>
        <li>You will respond to customer inquiries in good faith</li>
        <li>You will comply with all applicable local, state, and federal regulations</li>
        <li>You will not post fraudulent, harmful, or misleading information</li>
      </ul>

      {/* 4 */}
      <h3>4. Customer Responsibilities</h3>
      <p>Customers agree that:</p>
      <ul>
        <li>All inquiries and communications will be respectful and honest</li>
        <li>You will perform your own due diligence before agreeing to any transaction</li>
        <li>SPA-PAM is not responsible for the outcome of breeder–customer interactions</li>
      </ul>

      {/* 5 */}
      <h3>5. Communication & Messaging</h3>
      <p>
        SPA-PAM provides messaging tools for breeders and customers. You agree not to use
        these tools to send spam, harmful content, harassment, or solicitations unrelated
        to your dog-matching interests.
      </p>
      <p>
        SPA-PAM may monitor, restrict, or disable messaging features if misuse is detected.
      </p>

      {/* 6 */}
      <h3>6. Listings, Accuracy & Third-Party Content</h3>
      <p>
        All breeder listings, photos, descriptions, and prices are user-generated.
        SPA-PAM does not guarantee:
      </p>
      <ul>
        <li>The accuracy of any listing or breeder profile</li>
        <li>The health, temperament, or authenticity of a dog</li>
        <li>The legitimacy of any breeder’s claims or documentation</li>
      </ul>
      <p>
        You acknowledge that SPA-PAM is a listing platform and does not broker sales,
        verify contracts, or participate in transactions.
      </p>

      {/* 7 */}
      <h3>7. No Veterinary, Legal, or Financial Advice</h3>
      <p>
        Information found on the platform should not be relied upon as professional advice.
        Users should consult licensed veterinarians, legal professionals, or financial
        advisors when making decisions.
      </p>

      {/* 8 */}
      <h3>8. Limitation of Liability</h3>
      <p>
        SPA-PAM is not responsible for any direct or indirect damages arising from your
        use of the platform. This includes, but is not limited to:
      </p>
      <ul>
        <li>Miscommunication or disputes between users</li>
        <li>Financial loss or fraudulent activity</li>
        <li>Health issues regarding any listed dog</li>
        <li>Data breaches, downtime, or system errors</li>
      </ul>
      <p>
        You agree to use SPA-PAM at your own risk.
      </p>

      {/* 9 */}
      <h3>9. Account Security</h3>
      <p>
        You are responsible for safeguarding your account credentials.
        Any activity conducted under your account is your responsibility.
      </p>

      {/* 10 */}
      <h3>10. Modifications to These Terms</h3>
      <p>
        We may update these Terms at any time. Continued use of the platform after changes
        are published constitutes your acceptance of the revised Terms.
      </p>

      <p className="text-muted mt-4">
        If you have questions regarding these Terms, please contact our support team.
      </p>
    </div>
  );
};

export default TermsOfService;
