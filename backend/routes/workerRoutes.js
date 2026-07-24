const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const authMiddleware = require('../authMiddleware');

const router = express.Router();

// Helper: generate next worker_id
async function generateWorkerId(db) {
    const last = await db.collection('workers')
        .find({}, { projection: { worker_id: 1 } })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

    if (last.length === 0) return 'WRK1001';

    const lastId = last[0].worker_id || 'WRK1000';
    const num = parseInt(lastId.replace('WRK', ''), 10) || 1000;
    return `WRK${num + 1}`;
}

// GET /api/workers — list all workers
router.get('/', async (req, res) => {
    try {
        const db = await getDB();
        const workers = await db.collection('workers').find({}).sort({ createdAt: -1 }).toArray();
        res.json(workers);
    } catch (err) {
        console.error('Error fetching workers:', err.message);
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
});

// GET /api/workers/available — list only available workers
router.get('/available', async (req, res) => {
    try {
        const db = await getDB();
        const workers = await db.collection('workers')
            .find({ status: 'Available' })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(workers);
    } catch (err) {
        console.error('Error fetching available workers:', err.message);
        res.status(500).json({ error: 'Failed to fetch available workers' });
    }
});

// GET /api/workers/applications/pending — list pending applications
router.get('/applications/pending', async (req, res) => {
    try {
        const db = await getDB();
        const applications = await db.collection('worker_applications')
            .find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(applications);
    } catch (err) {
        console.error('Error fetching pending applications:', err.message);
        res.status(500).json({ error: 'Failed to fetch pending applications' });
    }
});

// POST /api/workers — register a new worker application
router.post('/', async (req, res) => {
    try {
        const { name, profile_image, phone, address, experience_details, years_of_experience } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }

        const db = await getDB();

        const doc = {
            name: name.trim(),
            profile_image: profile_image || '',
            phone: phone.trim(),
            address: address || '',
            experience_details: experience_details || '',
            years_of_experience: parseInt(years_of_experience) || 0,
            status: 'pending',
            createdAt: new Date()
        };

        const result = await db.collection('worker_applications').insertOne(doc);
        res.status(201).json({ insertedId: result.insertedId, message: 'Application submitted successfully' });
    } catch (err) {
        console.error('Error registering worker application:', err.message);
        res.status(500).json({ error: 'Failed to submit worker application' });
    }
});

// PUT /api/workers/applications/:id/approve — approve a pending application
router.put('/applications/:id/approve', authMiddleware, async (req, res) => {
    try {
        const db = await getDB();
        const appId = req.params.id;
        
        // Find the application
        const application = await db.collection('worker_applications').findOne({ _id: new ObjectId(appId) });
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Generate Worker ID
        const worker_id = await generateWorkerId(db);

        // Prepare worker document
        const workerDoc = {
            worker_id,
            name: application.name,
            profile_image: application.profile_image,
            phone: application.phone,
            address: application.address,
            experience_details: application.experience_details,
            years_of_experience: application.years_of_experience,
            status: 'Available',
            createdAt: new Date()
        };

        // Insert into workers and delete from applications
        await db.collection('workers').insertOne(workerDoc);
        await db.collection('worker_applications').deleteOne({ _id: new ObjectId(appId) });

        res.json({ message: 'Worker approved successfully', worker_id });
    } catch (err) {
        console.error('Error approving application:', err.message);
        res.status(500).json({ error: 'Failed to approve application' });
    }
});

// DELETE /api/workers/applications/:id — reject/delete application
router.delete('/applications/:id', authMiddleware, async (req, res) => {
    try {
        const db = await getDB();
        const result = await db.collection('worker_applications').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Application not found' });
        res.json({ message: 'Application rejected successfully' });
    } catch (err) {
        console.error('Error rejecting application:', err.message);
        res.status(500).json({ error: 'Failed to reject application' });
    }
});

// PUT /api/workers/:id/status — toggle Available / Busy
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Available', 'Busy'].includes(status)) {
            return res.status(400).json({ error: 'Status must be Available or Busy' });
        }
        const db = await getDB();
        const result = await db.collection('workers').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, updatedAt: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Worker not found' });
        res.json({ message: `Worker status updated to ${status}` });
    } catch (err) {
        console.error('Error updating worker status:', err.message);
        res.status(500).json({ error: 'Failed to update worker status' });
    }
});

// DELETE /api/workers/:id — delete a worker
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const db = await getDB();
        const result = await db.collection('workers').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Worker not found' });
        res.json({ message: 'Worker deleted successfully' });
    } catch (err) {
        console.error('Error deleting worker:', err.message);
        res.status(500).json({ error: 'Failed to delete worker' });
    }
});

module.exports = router;
