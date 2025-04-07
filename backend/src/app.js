const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong on the server'
    });
});

module.exports = app;