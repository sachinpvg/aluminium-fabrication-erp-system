require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'sachin';

let client = null;
let db = null;

async function getDB() {
    try {
        // Reconnect if client is missing or topology is not connected
        const isConnected = client && client.topology && client.topology.isConnected();

        if (!isConnected) {
            // Close any stale client first
            if (client) {
                try { await client.close(); } catch (_) { }
            }

            client = new MongoClient(uri, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
            });

            await client.connect();
            db = client.db(dbName);
            console.log("✅ MongoDB Atlas Connected Successfully");
        }

        return db;

    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        // Reset so next call tries a fresh connect
        client = null;
        db = null;
        throw err;
    }
}

module.exports = { getDB };
