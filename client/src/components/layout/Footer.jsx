/**
 * @file Footer.jsx
 * @description App footer with links, branding, and GDPR/CCPA consent tracking.
 */

import React from 'react';
import {useAuth} from '../../context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {CURRENT_CONSENT_VERSION, CONSENT_EXPIRY_DAYS} from '../../constants';
import axiosInstance from '../../axiosInstance';
import {toast} from 'react-toastify';
import './Footer.css';

const Footer = () => {
    const {user, setUser} = useAuth();
    const navigate = useNavigate();
    const consent = user?.consent;

    // Dynamic consent validity checker
    const isConsentValid = () => {
        if (!consent || !consent.agreed) return false;

        const consentDate = new Date(consent.timestamp);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() - CONSENT_EXPIRY_DAYS);

        const isExpired = consentDate < expiryDate;
        const isOutdated = consent.consentVersion !== CURRENT_CONSENT_VERSION;

        return !isExpired && !isOutdated;
    };

    // Accept handler
    const handleConsentAccept = async () => {
        if (!user) {
            toast.info('Please log in before accepting consent.');
            navigate('/login');
            return;
        }

        try {
            const response = await axiosInstance.post('/api/user/give-consent', {
                agreed: true,
                version: CURRENT_CONSENT_VERSION,
            });

            if (response.data && response.data.updatedUser) {
                setUser(response.data.updatedUser);
                toast.success('Consent accepted');
            }
        } catch (err) {
            toast.error('Failed to record consent');
        }
    };

    return (
        <footer className="footer bg-light text-dark py-4 border-top position-relative">

            <div className="container">

                <div className="row text-center text-md-start">
                    <div className="col-md-3 mb-3">
                        <h6><b>Dog Breeder & Customer Community</b></h6>
                        <p>
                            Platform Connecting responsible breeders with loving homes. List, manage, and track dogs and
                            conversations in one secure, easy-to-use dashboard.

                        </p>

                    </div>
                    <div className="col-md-2 mb-3">
                        <h6>QUICK LINKS</h6>
                        <ul className="list-unstyled">
                            <li><a href="/">Home</a></li>
                            <li><a href="/about">About</a></li>
                        </ul>
                    </div>
                    <div className="col-md-2 mb-3">
                        <h6>FOLLOW US</h6>
                        <ul className="list-unstyled">
                            <li><a href="https://www.instagram.com">Instagram</a></li>
                            <li><a href="https://www.facebook.com">Facebook</a></li>
                            <li><a href="https://www.linkedin.com">LinkedIn</a></li>
                        </ul>
                    </div>
                    <div className="col-md-2 mb-3">
                        <h6>LEGAL</h6>
                        <ul className="list-unstyled">
                            <li><a href="/privacy-policy">Privacy Policy</a></li>
                            <li><a href="/terms-of-service">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div className="col-md-3 mb-3">
                        <h6>Consent Status</h6>
                        {consent?.agreed ? (
                            <>
                                <p>
                                    <strong>Consent Status:</strong>{' '}
                                    <span className="text-success"> ✅ Consent Given</span>
                                </p>
                                <p className="text-muted small">
                                    (Since {new Date(consent.timestamp).toLocaleString()})
                                </p>
                            </>
                        ) : (
                            <p className="text-danger">Consent not given</p>
                        )}
                        <p className="text-muted small">
                            This refers to your agreement to our use of your personal data under the{' '}
                            <a href="/privacy-policy">Privacy Policy</a>.
                        </p>
                    </div>

                </div>

                {!isConsentValid() && (
                    <div
                        className="consent-banner bg-dark text-light p-3 d-flex justify-content-between align-items-center fixed-bottom">
            <span>
              We collect usage data to improve your experience. By clicking “Accept,” you agree to our{' '}
                <a href="/privacy-policy" className="text-info">Privacy Policy</a>.
            </span>
                        <button className="btn btn-danger btn-sm ms-3" onClick={handleConsentAccept}>
                            Accept
                        </button>
                    </div>
                )}

                <div className="text-center mt-3 small text-muted">
                    &copy; {new Date().getFullYear()} AI Resume App. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
