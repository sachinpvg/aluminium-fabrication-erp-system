const express = require('express');
const { getDB } = require('../db');

const router = express.Router();

// GET /api/admin/analytics
router.get('/', async (req, res) => {
    try {
        const db = await getDB();
        
        // Fetch valid bookings (paid or booked, maybe also pending, but definitely not rejected to show revenue potential)
        // Actually, we'll fetch all non-rejected bookings for stats. Or maybe all bookings to be safe and accurate, 
        // since cost/price might be 0 for rejected anyway.
        const bookings = await db.collection('bookings').find({
            status: { $ne: 'rejected' }
        }).toArray();

        let totalBookings = bookings.length;
        let totalRevenue = 0;
        let totalCost = 0;

        // Calculate totals
        const dateMap = {}; // for storing daily stats

        // To generate last 30 days data safely, initialize the map with dates to avoid empty slots:
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            dateMap[dateString] = { date: dateString, revenue: 0, cost: 0, bookings: 0 };
        }

        bookings.forEach(booking => {
            const price = parseFloat(booking.totalPrice) || parseFloat(booking.windowPrice) || 0;
            const cost = parseFloat(booking.cost) || 0;
            
            totalRevenue += price;
            totalCost += cost;

            if (booking.createdAt) {
                const dateKey = new Date(booking.createdAt).toISOString().split('T')[0];
                if (dateMap[dateKey]) {
                    dateMap[dateKey].revenue += price;
                    dateMap[dateKey].cost += cost;
                    dateMap[dateKey].bookings += 1;
                }
            }
        });

        const totalProfit = totalRevenue - totalCost;
        const totalLoss = totalCost > totalRevenue ? (totalCost - totalRevenue) : 0;

        // Convert map to array and sort chronologically
        const dailyStats = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({
            totals: {
                totalBookings,
                totalRevenue,
                totalCost,
                totalProfit,
                totalLoss
            },
            dailyStats
        });

    } catch (err) {
        console.error('Error fetching analytics:', err.message);
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
});

module.exports = router;
