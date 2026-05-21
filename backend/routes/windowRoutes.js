const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

const router = express.Router();

// GET /api/windows — get all windows (public)
router.get('/', async (req, res) => {
    try {
        const db = await getDB();
        const windows = await db.collection('windows').find({}).sort({ createdAt: -1 }).toArray();
        res.json(windows);
    } catch (err) {
        console.error('Error fetching windows:', err.message);
        res.status(500).json({ error: 'Failed to fetch windows' });
    }
});

// POST /api/windows — add a new window (admin)
router.post('/', async (req, res) => {
    try {
        const { name, description, image, windowType, price_per_sqft, labour_charge, rubber_charge, service_charge } = req.body;
        if (!name || !price_per_sqft) {
            return res.status(400).json({ error: 'Name and price_per_sqft are required' });
        }
        const db = await getDB();
        const doc = {
            name,
            description: description || '',
            image: image || '',
            windowType: windowType || 'Aluminium',
            price_per_sqft: parseFloat(price_per_sqft) || 0,
            labour_charge: parseFloat(labour_charge) || 0,
            rubber_charge: parseFloat(rubber_charge) || 0,
            service_charge: parseFloat(service_charge) || 0,
            createdAt: new Date()
        };
        const result = await db.collection('windows').insertOne(doc);
        res.status(201).json({ insertedId: result.insertedId, message: 'Window added successfully' });
    } catch (err) {
        console.error('Error adding window:', err.message);
        res.status(500).json({ error: 'Failed to add window' });
    }
});

// PUT /api/windows/:id — update a window (admin)
router.put('/:id', async (req, res) => {
    try {
        const { name, description, image, windowType, price_per_sqft, labour_charge, rubber_charge, service_charge } = req.body;
        const db = await getDB();
        const result = await db.collection('windows').updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    name,
                    description: description || '',
                    image: image || '',
                    windowType: windowType || 'Aluminium',
                    price_per_sqft: parseFloat(price_per_sqft) || 0,
                    labour_charge: parseFloat(labour_charge) || 0,
                    rubber_charge: parseFloat(rubber_charge) || 0,
                    service_charge: parseFloat(service_charge) || 0,
                    updatedAt: new Date()
                }
            }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Window not found' });
        res.json({ message: 'Window updated successfully' });
    } catch (err) {
        console.error('Error updating window:', err.message);
        res.status(500).json({ error: 'Failed to update window' });
    }
});

// DELETE /api/windows/:id — delete a window (admin)
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDB();
        const result = await db.collection('windows').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Window not found' });
        res.json({ message: 'Window deleted successfully' });
    } catch (err) {
        console.error('Error deleting window:', err.message);
        res.status(500).json({ error: 'Failed to delete window' });
    }
});

module.exports = router;
