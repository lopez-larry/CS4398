/**
 * @file passport.js
 * @description Configures authentication strategies for the application using Passport.js.
 *
 * Features:
 *  - Integrates OAuth strategies (e.g., Google OAuth 2.0).
 *  - Provides middleware for user authentication.
 *  - Configures serialization and deserialization of user sessions.
 *  - Implements role assignment during the OAuth flow (e.g., assigns "user" role by default).
 *
 * Dependencies:
 *  - passport: Main Passport.js library.
 *  - passport-google-oauth20: For Google OAuth 2.0 authentication.
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust the path to your User model

// Google OAuth Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: '/api/user/google/callback',
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ googleId: profile.id });
//
//         if (!user) {
//           user = new User({
//             username: profile.displayName,
//             email: profile.emails[0].value,
//             googleId: profile.id,
//             role: 'user',
//           });
//           await user.save();
//         }
//
//         done(null, user);
//       } catch (err) {
//         console.error('Error in Google OAuth strategy:', err);
//         done(err, null);
//       }
//     }
//   )
// );

// Minimal session data
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Always get fresh user data from MongoDB
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean(); // fresh and lean version
    if (user) {
      delete user.password; // Optional: remove sensitive field
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
