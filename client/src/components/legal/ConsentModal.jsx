/**
 * @file ConsentModal.jsx
 * @description Bottom banner with Accept button and Manage Settings link (industry style).
 */

import React from 'react';
import './ConsentModal.css';
import { Button } from 'react-bootstrap';


const ConsentModal = ({ show, onAccept, onManageSettings }) => {
  if (!show) return null;

  return (
    <div className="consent-banner d-flex justify-content-between align-items-center px-4 py-3">
      <div>
          We collect usage data to improve your experience. By clicking “Accept,” you agree to our
            <a href="/privacy-policy" target="_blank" rel="noreferrer" className="ms-1 text-white text-decoration-underline">
              Privacy Policy
            </a>.

      </div>
      <Button variant="danger" onClick={onAccept}>
        Accept
      </Button>
    </div>
  );
};

export default ConsentModal;
