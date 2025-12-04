/**
 * @file userRoutes.js
 * @description Defines authentication routes and handles user authentication, registration, consent, profile, and account deletion.
 */

// Core libraries
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const validator = require('validator');
const passport = require('passport');

// Utilities
const sendEmail = require('../utils/emailService');

// AWS SDK
const {PutObjectCommand, GetObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner');
const {s3, bucketName} = require('../config/s3');

// Middleware
const jwtAuth = require('../middleware/jwtAuth');
const rateLimit = require('express-rate-limit');
const {ensureAuth, ensureVerified, ensureAdmin} = require('../middleware/authMiddleware');
const logAudit = require('../utils/logAudit');
const {buildSafeUserResponse} = require('../utils/userHelpers');
const multer = require('multer');
const upload = multer({limits: {fileSize: 1024 * 1024}}); // 1MB limit

// Models
const User = require('../models/User');
const Dog = require('../models/Dog');
const LoginAttempt = require('../models/LoginAttempt');
const ConsentPolicy = require('../models/ConsentPolicy');
const {
    getCurrentUser,
    updateProfile,
    changePassword,
    deleteAccount,
} = require('../controllers/userController');

// Express Router
const router = express.Router();

const isProd = process.env.NODE_ENV === 'production';

// Rate limiters
const loginLimiter = rateLimit({
    windowMs: isProd ? 10 * 60 * 1000 : 60 * 1000,
    max: isProd ? 5 : 1000,
    message: 'Too many login attempts. Try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: isProd ? 60 * 60 * 1000 : 60 * 1000,
    max: isProd ? 10 : 500,
    message: 'Too many registration attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const forgotLimiter = rateLimit({
    windowMs: isProd ? 15 * 60 * 1000 : 60 * 1000,
    max: isProd ? 3 : 200,
    message: 'Too many password reset requests. Please wait before retrying.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Validation helpers
const isValidUsername = (name) => /^[a-zA-Z0-9_-]{3,30}$/.test(name);
const isStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);

// Helper to send verification email
async function sendVerificationEmail(toEmail, token) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    await sendEmail({
        to: toEmail,
        subject: 'Verify your email address',
        html: `
      <h2>Email Verification</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
    });
}

// -------------------------------------------------------------
// Helper
// -------------------------------------------------------------
function buildEmail({username, link, action}) {
    return {
        html: `
      <p>Hello ${username || "User"},</p>
      <p>Please ${action} by clicking the link below:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link will expire in 24 hours.</p>
    `,
        text: `Hello ${username || "User"},\n\nPlease ${action} by opening this link:\n${link}\n\nThis link will expire in 24 hours.`
    };
}

// -------------------------------------------------------------
// AWS SES email routes
// -------------------------------------------------------------
// --- Public registration route (creates user + sends email verification)
router.post('/public-register', registerLimiter, async (req, res) => {
    try {
        const {username, email, password} = req.body;

        // check for duplicates
        let existing = await User.findOne({email});
        if (existing) {
            return res.status(400).json({message: 'Email already in use'});
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        let user = new User({
            username,
            email,
            password: hashedPassword,
            role: 'customer',
        });

        // generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerifyToken = verificationToken;
        user.emailVerifyExpire = Date.now() + 24 * 3600000; // 24 hours

        await user.save();

        // send email with verification link
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
        await sendEmail({
            to: user.email,
            subject: "Verify your email address",
            html: `
        <h2>Email Verification</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `,
        });

        console.log('[DEBUG] Generated email verification token:', verificationToken);

        res.status(201).json({
            message: 'User registered. Please check your email to verify your account.',
        });
    } catch (err) {
        console.error('[ERROR] Registration failed:', err);
        res.status(500).json({message: 'Registration failed'});
    }
});

// --- Resend verification email
router.post("/resend-verification", async (req, res) => {
    const {email} = req.body;
    const clientIP = req.headers["x-forwarded-for"] || req.ip;

    try {
        const user = await User.findOne({email});

        if (!user) {
            console.log("[DEBUG] Resend verification requested for non-existent user:", email);
            return res.status(404).json({message: "User not found."});
        }

        if (user.isVerified) {
            console.log("[DEBUG] Resend verification requested for already verified user:", email);
            return res.status(400).json({message: "User is already verified."});
        }

        // Generate new token + expiry
        const verificationToken = crypto.randomBytes(32).toString("hex");
        user.emailVerifyToken = verificationToken;
        user.emailVerifyExpire = Date.now() + 24 * 3600000; // 24 hours
        await user.save();

        // Build verification link
        const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        // Send email via SES
        await sendEmail({
            to: user.email,
            subject: "Verify Your Email Address",
            html: `
        <p>Hello ${user.firstName || "User"},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
        });

        console.log("[DEBUG] Verification email resent successfully:", email);

        // Audit log
        await logAudit({
            userId: user._id,
            action: "VERIFICATION_EMAIL_RESENT",
            ip: clientIP,
            metadata: {email: user.email, verificationToken},
        });

        return res.json({message: "Verification email resent successfully."});
    } catch (err) {
        console.error("[ERROR] Resend verification failed:", err);
        return res.status(500).json({message: "Error resending verification email."});
    }
});

// --- Verify email with token ---
router.post("/verify-email", async (req, res) => {
    try {
        const {token} = req.body;

        // Find user with valid token
        const user = await User.findOne({
            emailVerifyToken: token,
            emailVerifyExpire: {$gt: Date.now()}, // not expired
        });

        if (!user) {
            console.log("[DEBUG] Invalid or expired email verification token:", token);
            return res.status(400).json({message: "Invalid or expired verification link."});
        }

        // Mark verified
        user.isVerified = true;
        user.emailVerifyToken = undefined;
        user.emailVerifyExpire = undefined;
        await user.save();

        console.log("[DEBUG] Email verification success for:", user.email);
        return res.status(200).json({message: "Email verified successfully."});
    } catch (err) {
        console.error("[ERROR] Email verification failed:", err);
        res.status(500).json({message: "Server error verifying email."});
    }
});

// --- Password reset (public entry point) ---
router.post("/forgot-password", async (req, res) => {
    const {email} = req.body;
    const clientIP = req.headers["x-forwarded-for"] || req.ip;

    try {
        const user = await User.findOne({email});

        if (!user) {
            console.log("[DEBUG] Forgot password requested for non-existent email:", email);
            return res.status(404).json({message: "User not found."});
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetToken = resetToken;
        user.resetTokenExpire = Date.now() + 3600000; // 1 hour
        await user.save();

        // Build reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Build email content
        const mail = {
            subject: "Password Reset Request",
            html: `
        <p>Hello ${user.username || "User"},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
      `,
        };

        // Send via SES
        await sendEmail({
            to: user.email,
            subject: mail.subject,
            html: mail.html,
        });

        console.log("[DEBUG] Forgot password email sent successfully:", email);

        // Audit log
        await logAudit({
            userId: user._id,
            action: "FORGOT_PASSWORD_REQUESTED",
            ip: clientIP,
            metadata: {email: user.email},
        });

        return res.status(200).json({message: "Password reset link sent to your email."});
    } catch (err) {
        console.error("[ERROR] Forgot password failed:", err);
        return res.status(500).json({message: "Error processing password reset request."});
    }
});

// --- Reset password (public entry point) ---
router.post("/reset-password/:token", async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;
    const clientIP = req.headers["x-forwarded-for"] || req.ip;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpire: {$gt: Date.now()}, // must not be expired
        });

        if (!user) {
            console.log("[DEBUG] Reset password requested with invalid/expired token:", token);
            return res.status(400).json({message: "Invalid or expired reset link."});
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset token fields
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save();

        // Send confirmation email
        await sendEmail({
            to: user.email,
            subject: "Your Password Has Been Reset",
            html: `
        <p>Hello ${user.username || "User"},</p>
        <p>Your password has been successfully reset. If this wasn’t you, please contact support immediately.</p>
      `,
        });

        console.log("[DEBUG] Password reset successful for:", user.email);

        // Audit log
        await logAudit({
            userId: user._id,
            action: "RESET_PASSWORD_SUCCESS",
            ip: clientIP,
            metadata: {email: user.email},
        });

        return res.status(200).json({message: "Password reset successful."});
    } catch (err) {
        console.error("[ERROR] Reset password failed:", err);
        return res.status(500).json({message: "Error resetting password."});
    }
});

// --- Session / Auth ---
router.post('/logout', ensureAuth, async (req, res) => {
    try {
        // ✅ Clear the auth cookie for cross-site sessions
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        });

        if (req.user) {
            await logAudit({
                userId: req.user._id,
                action: 'LOGOUT',
                ip: req.headers['x-forwarded-for'] || req.ip,
                metadata: {email: req.user.email}
            });
        }
        return res.status(200).json({message: 'Logged out'});
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({error: 'Logout failed'});
    }
});

// --- Session / Auth ---
router.post('/login', loginLimiter, async (req, res) => {
    const {email, password} = req.body;
    const clientIP = req.headers['x-forwarded-for'] || req.ip;
    try {
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({message: 'Invalid credentials format.'});
        }

        const user = await User.findOne({email}).select("+password");
        if (!user) {
            await LoginAttempt.create({email, ip: clientIP, endpoint: '/login', success: false});
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await LoginAttempt.create({email, ip: clientIP, endpoint: '/login', success: false});
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const token = jwt.sign(
            {id: user._id, role: user.role, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );

        // ✅ Set secure HttpOnly cookie for cross-domain session (CloudFront -> API)
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,          // requires HTTPS (you have it)
            sameSite: 'None',      // required for cross-site
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        await LoginAttempt.create({email, ip: clientIP, endpoint: '/login', success: true});
        await logAudit({
            userId: user._id,
            action: 'LOGIN_SUCCESS',
            ip: clientIP,
            metadata: {email}
        });

        // ✅ Hybrid response: keep token in JSON for existing clients,
        // but the cookie is what your CloudFront app will use.
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                ...buildSafeUserResponse(user),
                isVerified: user.isVerified
            },
            unverified: !user.isVerified
        });
    } catch (err) {
        console.error(`Unexpected login error from IP: ${clientIP}`, err);
        res.status(500).json({message: 'An error occurred during login'});
    }
});

// --- Admin register (admin must also be verified) ---
router.post('/register', ensureAuth, ensureVerified, ensureAdmin, async (req, res) => {
    console.log('POST /register hit');
    console.log('Request body:', req.body);
    const {name, email, password, role} = req.body;

    if (role && req.user.role !== 'admin') {
        return res.status(403).json({message: 'Only admins can assign roles'});
    }

    if (!isValidUsername(name)) {
        return res.status(400).json({
            message: 'Username must be 3–30 characters and can only include letters, numbers, underscores, and dashes.',
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username: name,
            email,
            password: hashedPassword,
            role: role || 'user',
        });

        const userIP = req.headers['x-forwarded-for'] || req.ip;

        user.consent = {
            agreed: true,
            timestamp: new Date(),
            ip: userIP,
        };

        await user.save();

        // Audit log
        await logAudit({
            userId: req.user._id,
            action: 'ADMIN_REGISTER_USER',
            ip: req.headers['x-forwarded-for'] || req.ip,
            metadata: {
                createdUserId: user._id,
                createdUsername: name,
                createdEmail: email,
                assignedRole: role || 'user'
            }
        });

        res.status(201).json({message: 'User registered successfully'});

    } catch (err) {
        console.error('Error registering user:', err);

        await logAudit({
            userId: req.user._id,
            action: 'ADMIN_REGISTER_FAILED',
            ip: req.headers['x-forwarded-for'] || req.ip,
            metadata: {
                attemptedUsername: name,
                attemptedEmail: email,
                assignedRole: role || 'user',
                error: err.message
            }
        });

        res.status(500).json({message: err.message});
    }
});

// --- Consent policy (public) ---
router.get('/consent-version', async (req, res) => {
    const policy = await ConsentPolicy.findOne().sort({updatedAt: -1}).limit(1);
    if (!policy) return res.status(404).json({error: 'Consent policy not found'});

    res.json({version: policy.version, updatedAt: policy.updatedAt});
});

// --- Current authenticated user (must be logged in) ---
router.get('/current_user', jwtAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        let profileImageUrl;
        if (user.profileImageKey) {
            profileImageUrl = await getSignedUrl(
                s3,
                new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: user.profileImageKey,
                }),
                {expiresIn: 3600} // 1 hour
            );
        }

        res.json({
            ...buildSafeUserResponse(user.toObject()),
            profileImageUrl,
        });
    } catch (err) {
        console.error('Error fetching current user:', err);
        res.status(500).json({message: 'Failed to fetch user'});
    }
});

// --- Change password (must be logged in & verified) ---
router.post('/change-password', ensureAuth, ensureVerified, changePassword);

// --- Update profile (must be logged in & verified) ---
router.put(
    '/profile',
    ensureAuth,
    ensureVerified,
    upload.single('profileImage'),
    updateProfile
);

// --- Profile image uploads/remove (must be logged in & verified) ---
router.post(
    '/upload-profile-image',
    ensureAuth,
    ensureVerified,
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({message: 'No file uploaded'});
            }

            // Generate S3 key: profiles/{userId}/{timestamp}-{filename}
            const key = `profiles/${req.user._id}/${Date.now()}-${req.file.originalname}`;

            await s3.send(new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }));

            // Save key to user
            const user = await User.findByIdAndUpdate(
                req.user._id,
                {profileImageKey: key},
                {new: true}
            );

            // Generate signed URL
            const signedUrl = await getSignedUrl(
                s3,
                new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key},
                ),
                {expiresIn: 3600}
            );

            res.json({updatedUser: {...user.toObject(), profileImageUrl: signedUrl}});
        } catch (err) {
            console.error('Profile image upload error:', err);
            res.status(500).json({message: 'Upload failed'});
        }
    }
);

router.delete(
    '/remove-profile-image',
    ensureAuth,
    ensureVerified,
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({message: 'User not found'});

            if (user.profileImageKey) {
                // Delete from S3
                await s3.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: user.profileImageKey,
                }));
            }

            // Clear field in DB
            user.profileImageKey = undefined;
            await user.save();

            res.json({message: 'Profile image removed successfully'});
        } catch (err) {
            console.error('Profile image remove error:', err);
            res.status(500).json({message: 'Server error'});
        }
    }
);

// --- Consent (verified required) ---
router.post('/give-consent', ensureAuth, ensureVerified, async (req, res) => {
    const {agreed} = req.body;
    const userId = req.user._id;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: 'User not found.'});
        }

        const timestamp = new Date();
        user.consent = {
            agreed,
            timestamp,
            ip,
            consentVersion: 'v1.0', // Move to constants.js if reused
        };

        await user.save();

        console.log(`[AUDIT] Consent ${agreed ? 'given' : 'withdrawn'} by ${user.email} from IP ${ip} on ${timestamp.toISOString()}`);

        res.json({
            message: `Consent ${agreed ? 'given' : 'withdrawn'} successfully.`,
            user: buildSafeUserResponse(user),
        });
    } catch (err) {
        console.error(`[ERROR] Consent update failed for user ${userId}:`, err);
        res.status(500).json({message: 'Failed to update consent.'});
    }
});

router.put('/withdraw-consent', ensureAuth, ensureVerified, async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({message: 'User not found'});

        user.consent.agreed = false;
        user.consent.timestamp = new Date();
        user.consent.consentVersion = 'v1.0';
        await user.save();

        await logAudit({
            userId: req.user._id,
            action: 'CONSENT_WITHDRAWN',
            ip,
            userAgent,
            metadata: {
                consentVersion: 'v1.0'
            }
        });

        res.json({message: 'Consent withdrawn', user: buildSafeUserResponse(user.toObject())});
    } catch (err) {
        console.error('Consent withdrawal failed:', err);
        res.status(500).json({message: 'Error withdrawing consent'});
    }
});

// --- Delete account (must be logged in & verified) ---
router.delete(
    '/delete-account',
    ensureAuth,
    ensureVerified,
    deleteAccount
);

module.exports = router;
