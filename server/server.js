/**
 * @file server.js
 * @description Main entry point for the backend server.
 */

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const trackCookies = require('./middleware/trackCookies');
const auditLogger = require('./middleware/auditLogger');
const sanitizeInput = require('./middleware/sanitizeInput');
const { connectDB } = require('./config/db');

// Feature routes
const postRoutes = require('./routes/postRoutes');
const dogRoutes = require('./routes/dogRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const breedRoutes = require('./routes/breedRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const breederRoutes = require('./routes/breederRoutes');
const contactRoutes = require("./routes/contactRoutes");
const adminRoutes = require("./routes/adminRoutes");
const publicRoutes = require("./routes/publicRoutes");
const healthRoute = require("./routes/healthRoute");
const policyRoute = require("./routes/policyRoute");

dotenv.config();

// ---------------------------------------------
// Connect DB
// ---------------------------------------------
connectDB();

// ---------------------------------------------
// App Setup
// ---------------------------------------------
const app = express();
app.set("trust proxy", true); // Required for CloudFront or any proxy

const isProd = process.env.NODE_ENV === "production";

// ---------------------------------------------
// Login Rate Limiter (SAFE VERSION)
// ---------------------------------------------
let loginLimiter;

if (isProd) {
  loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,             // allow 10 login attempts per minute per IP
    message: "Too many login attempts. Please try again shortly.",
    standardHeaders: true,
    legacyHeaders: false
  });
} else {
  console.log("⚠️ Development mode: Login rate limiter DISABLED");
  loginLimiter = (req, res, next) => next(); // no limiting in dev
}

// ---------------------------------------------
// Middleware
// ---------------------------------------------
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://d3ksowre3dfy72.cloudfront.net',
  'https://api.larry-lopez.com',
  'https://larry-lopez.com',
  'https://www.larry-lopez.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(sanitizeInput);
app.use(morgan('dev'));
app.use(auditLogger);
app.use(trackCookies);

// ---------------------------------------------
// ROUTES
// ---------------------------------------------
app.use("/api/user/login", loginLimiter); // secure login
app.use("/api/user/forgot-password", loginLimiter);

app.use('/api/posts', postRoutes);
app.use('/api/dogs', dogRoutes);
app.use('/api/breeds', breedRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/breeders', breederRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', healthRoute);
app.use('/api/policies', policyRoute);
app.use("/api/contact", contactRoutes);
app.use('/api/upload', uploadRoutes);

// Debug
app.get('/', (req, res) => {
  res.send('Backend is running.');
});

app.get('/debug/cookies', (req, res) => {
  res.json({ cookies: req.cookies });
});

// ---------------------------------------------
// Start Server
// ---------------------------------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
