const express = require('express');
const router = express.Router();

// Mock authentication routes for now
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Simple mock authentication
    if (username && password) {
        res.json({
            success: true,
            user: { username },
            token: 'mock-jwt-token'
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }
});

router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;