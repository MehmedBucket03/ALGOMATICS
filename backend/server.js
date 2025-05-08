// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import routes - make sure these imports come AFTER declaring app
// const authRoutes = require('./src/routes/auth');
// const chatbotRoutes = require('./src/routes/chatbot');

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize the app - this must come BEFORE using app
const app = express();

// Middleware
app.use(helmet()); // Security middleware
// In your server.js file
app.use(cors());

app.use(express.json());

// Import routes - alternatively, you can move these imports here
const authRoutes = require('./src/routes/auth');
const chatbotRoutes = require('./src/routes/chatbot');

// Routes - these should come AFTER initializing app and importing the routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing


