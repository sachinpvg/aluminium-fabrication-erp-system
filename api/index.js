const serverless = require('serverless-http');

// Import the Express app from backend/server.js
// server.js exports the app and only calls listen() when run directly
const app = require('../backend/server');

module.exports = serverless(app);
