const express = require('express');
const router = express.Router();

// Auth routes
router.use('/auth', require('./auth'));

// Algorithm-related routes can be added here

module.exports = router;