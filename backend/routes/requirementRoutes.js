const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const authMiddleware = require('../authMiddleware');

const router = express.Router();

// GET /api/requirements — get all (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDB();
    const requirements = await db.collection('requirements').find({}).sort({ createdAt: -1 }).toArray();
    res.json(requirements);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching requirements');
  }
});

// GET /api/requirements/my — current user's requirements (protected)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const db = await getDB();
    const userId = req.user.userId || req.user.id;
    const requirements = await db.collection('requirements').find({
      $or: [{ userId }, { userEmail: req.user.email }]
    }).sort({ createdAt: -1 }).toArray();
    res.json(requirements);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching user requirements');
  }
});

// POST /api/requirements — save a new requirement (auth required)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDB();
    const doc = {
      ...req.body,
      userId: req.user.userId || req.user.id,
      userEmail: req.user.email,
      status: 'pending',
      createdAt: new Date()
    };
    const result = await db.collection('requirements').insertOne(doc);
    res.json({ insertedId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving requirement');
  }
});

// PATCH /api/requirements/:id/approve — admin approves + attaches quotation
router.patch('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { quotation } = req.body;
    if (!quotation || !quotation.totalAmount) {
      return res.status(400).json({ error: 'Quotation with totalAmount is required' });
    }
    const db = await getDB();
    const result = await db.collection('requirements').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status: 'approved',
          approvedAt: new Date(),
          quotation
        }
      }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Requirement not found' });
    res.json({ message: 'Approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Approval failed' });
  }
});

// PATCH /api/requirements/:id/reject — admin rejects with optional reason
router.patch('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const db = await getDB();
    const result = await db.collection('requirements').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status: 'rejected',
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || ''
        }
      }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Requirement not found' });
    res.json({ message: 'Rejected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Rejection failed' });
  }
});

module.exports = router;
