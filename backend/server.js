require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const authMiddleware = require('./authMiddleware');
const { getDB } = require('./db');

const app = express();

// ─────────────────────────────────────
// CORS — restrict to allowed origins
// ─────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());

const port = process.env.PORT || 8081;

const JWT_SECRET = process.env.JWT_SECRET;

// ─────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const adminMutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});


// ─────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────

// REGISTER
app.post('/auth/register', authLimiter, async (req, res) => {

    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) {

            return res.status(400).json({ error: "All fields required" });

        }

        const db = await getDB();

        const users = db.collection('loginsign');

        const existing = await users.findOne({ email });

        if (existing) {

            return res.status(409).json({ error: "Email already registered" });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        let suffix = '';

        for (let i = 0; i < 6; i++) {

            suffix += chars.charAt(Math.floor(Math.random() * chars.length));

        }

        const userId = `VEC-${suffix}`;

        await users.insertOne({

            username,
            email,
            password: hashedPassword,
            userId,
            role: "user",
            createdAt: new Date()

        });

        res.status(201).json({ message: "User registered", userId });

    } catch (err) {

        console.error(err);

        res.status(500).json({ error: "Registration failed" });

    }

});


// LOGIN
app.post('/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = await getDB();
        const users = db.collection('loginsign');
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const token = jwt.sign({
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role
        }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});


// ADMIN REGISTER
app.post('/auth/admin-register', authLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields required" });
        }
        const db = await getDB();
        const users = db.collection('loginsign');
        const existing = await users.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let suffix = '';
        for (let i = 0; i < 6; i++) {
            suffix += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const adminId = `ADM-${suffix}`;
        await users.insertOne({
            username,
            email,
            password: hashedPassword,
            userId: adminId,
            role: "admin",
            createdAt: new Date()
        });
        res.status(201).json({ message: "Admin registered", adminId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Admin registration failed" });
    }
});

// ADMIN LOGIN
app.post('/auth/admin-login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = await getDB();
        const users = db.collection('loginsign');
        // Only allow login if user actually exists AND has role admin
        const user = await users.findOne({ email, role: "admin" });
        if (!user) {
            return res.status(401).json({ error: "Invalid admin email or password" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid admin email or password" });
        }
        const token = jwt.sign({
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role
        }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Admin login failed" });
    }
});


// CURRENT USER
app.get('/auth/me', authMiddleware, (req, res) => {

    res.json({ user: req.user });

});


// ─────────────────────────────────────
// MODULE ROUTES
// ─────────────────────────────────────

const requirementRoutes = require('./routes/requirementRoutes');

app.use('/api/requirements', adminMutationLimiter, requirementRoutes);


const windowRoutes = require('./routes/windowRoutes');

app.use('/api/windows', adminMutationLimiter, windowRoutes);


const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/bookings', adminMutationLimiter, bookingRoutes);


const workerRoutes = require('./routes/workerRoutes');
app.use('/api/workers', adminMutationLimiter, workerRoutes);

const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', adminMutationLimiter, contactRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/admin/analytics', adminMutationLimiter, analyticsRoutes);


// ─────────────────────────────────────
// SERVER START
// ─────────────────────────────────────

// Only listen when run directly (not imported by serverless wrapper)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 Server running on http://localhost:${port}`);
    });
}

module.exports = app;