const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const authMiddleware = require('../authMiddleware');

const router = express.Router();

// POST /api/bookings — create a new booking (auth required)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            username, phone, address,
            windowId, windowName,
            width, height, fixingDate, notes,
            totalPrice, windowPrice, labourCharge, rubberCharge, serviceCharge
        } = req.body;

        if (!windowId || !width || !height || !fixingDate) {
            return res.status(400).json({ error: 'windowId, width, height, and fixingDate are required' });
        }

        const db = await getDB();
        const doc = {
            userId: req.user.userId || req.user.id,
            userEmail: req.user.email,
            username: username || req.user.username || '',
            phone: phone || '',
            address: address || '',
            windowId,
            windowName: windowName || '',
            width: parseFloat(width),
            height: parseFloat(height),
            fixingDate: new Date(fixingDate),
            notes: notes || '',
            windowPrice: parseFloat(windowPrice) || 0,
            labourCharge: parseFloat(labourCharge) || 0,
            rubberCharge: parseFloat(rubberCharge) || 0,
            serviceCharge: parseFloat(serviceCharge) || 0,
            totalPrice: parseFloat(totalPrice) || 0,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: new Date()
        };
        const result = await db.collection('bookings').insertOne(doc);
        res.status(201).json({ insertedId: result.insertedId, message: 'Booking created successfully' });
    } catch (err) {
        console.error('Error creating booking:', err.message);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// GET /api/bookings — get all bookings (admin)
router.get('/', async (req, res) => {
    try {
        const db = await getDB();
        const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err.message);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// GET /api/bookings/my — current user's bookings (auth required)
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const db = await getDB();
        const userId = req.user.userId || req.user.id;
        const bookings = await db.collection('bookings').find({
            $or: [{ userId }, { userEmail: req.user.email }]
        }).sort({ createdAt: -1 }).toArray();
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching user bookings:', err.message);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// PUT /api/bookings/:id/approve — admin approves: status = "booked"
router.put('/:id/approve', async (req, res) => {
    try {
        const db = await getDB();
        const result = await db.collection('bookings').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status: 'booked', approvedAt: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json({ message: 'Booking approved successfully' });
    } catch (err) {
        console.error('Error approving booking:', err.message);
        res.status(500).json({ error: 'Failed to approve booking' });
    }
});

// PUT /api/bookings/:id/reject — admin rejects: status = "rejected"
router.put('/:id/reject', async (req, res) => {
    try {
        const db = await getDB();
        const result = await db.collection('bookings').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status: 'rejected', rejectedAt: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json({ message: 'Booking rejected successfully' });
    } catch (err) {
        console.error('Error rejecting booking:', err.message);
        res.status(500).json({ error: 'Failed to reject booking' });
    }
});

// PUT /api/bookings/:id/payment — user pays: paymentStatus = "paid"
router.put('/:id/payment', authMiddleware, async (req, res) => {
    try {
        const db = await getDB();
        const result = await db.collection('bookings').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { paymentStatus: 'paid', paidAt: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json({ message: 'Payment successful' });
    } catch (err) {
        console.error('Error processing payment:', err.message);
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

// PUT /api/bookings/:id/assign-worker — admin assigns a worker to a paid booking
router.put('/:id/assign-worker', async (req, res) => {
    try {
        const { worker_id, worker_name, worker_phone, worker_image, worker_experience, years_of_experience } = req.body;
        if (!worker_id || !worker_name) {
            return res.status(400).json({ error: 'worker_id and worker_name are required' });
        }
        const db = await getDB();
        const result = await db.collection('bookings').updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    assigned_worker: {
                        worker_id,
                        worker_name,
                        worker_phone: worker_phone || '',
                        worker_image: worker_image || '',
                        worker_experience: worker_experience || '',
                        years_of_experience: years_of_experience || 0
                    },
                    assignedAt: new Date()
                }
            }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Booking not found' });
        res.json({ message: 'Worker assigned successfully' });
    } catch (err) {
        console.error('Error assigning worker:', err.message);
        res.status(500).json({ error: 'Failed to assign worker' });
    }
});

module.exports = router;
