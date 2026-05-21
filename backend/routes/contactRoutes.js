const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

const router = express.Router();

// POST /api/contact — submit a new contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !message) {
            return res.status(400).json({ error: 'Name and message are required' });
        }

        const db = await getDB();
        const doc = {
            name: name.trim(),
            email: email ? email.trim() : '',
            phone: phone ? phone.trim() : '',
            message: message.trim(),
            status: 'new',
            createdAt: new Date()
        };

        const result = await db.collection('contact_messages').insertOne(doc);
        res.status(201).json({ insertedId: result.insertedId, message: 'Message sent successfully' });
    } catch (err) {
        console.error('Error saving contact message:', err.message);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// GET /api/contact — list all contact messages
router.get('/', async (req, res) => {
    try {
        const db = await getDB();
        const messages = await db.collection('contact_messages').find({}).sort({ createdAt: -1 }).toArray();
        res.json(messages);
    } catch (err) {
        console.error('Error fetching contact messages:', err.message);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// PUT /api/contact/:id/respond — mark message as responded
router.put('/:id/respond', async (req, res) => {
    try {
        const db = await getDB();
        const result = await db.collection('contact_messages').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status: 'responded', respondedAt: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Message not found' });
        res.json({ message: 'Message marked as responded' });
    } catch (err) {
        console.error('Error updating message status:', err.message);
        res.status(500).json({ error: 'Failed to update message status' });
    }
});

module.exports = router;
