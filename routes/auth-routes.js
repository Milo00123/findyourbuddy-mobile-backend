// auth-routes.js
const express = require('express');
const { OAuth2Client } = require('google-auth-library'); 
const jwt = require('jsonwebtoken'); 
const db = require('../db'); 
const router = express.Router();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


//google
router.post('/login/google', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        const userEmail = payload.email;
        const providerId = payload.sub; 
        
        let user = await db.query('SELECT * FROM users WHERE provider_id = $1', [providerId]);
        if (user.rows.length === 0) {
            const insertResult = await db.query(
                'INSERT INTO users (email, provider_id) VALUES ($1, $2) RETURNING *',
                [userEmail, providerId]
            );
            user = insertResult.rows[0];
        } else {
            user = user.rows[0];
        }
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.providerId = user.provider_id;

        res.status(200).json({ message: 'Login successful', userId: user.id });
    } catch (error) {
        res.status(400).json({ message: 'Google authentication failed', error: error.message });
    }
});


//apple
router.post('/login/apple', async (req, res) => {
    const { token } = req.body;

    try {
        // Verify Apple token (Apple public key needed)
        const decoded = jwt.verify(token, process.env.APPLE_PUBLIC_KEY, {
            algorithms: ['RS256'],
        });

        const userEmail = decoded.email;
        const providerId = decoded.sub; 

        let user = await db.query('SELECT * FROM users WHERE provider_id = $1', [providerId]);
        if (user.rows.length === 0) {
            const insertResult = await db.query(
                'INSERT INTO users (email, provider_id) VALUES ($1, $2) RETURNING *',
                [userEmail, providerId]
            );
            user = insertResult.rows[0];
        } else {
            user = user.rows[0];
        }

        // Set user session
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.providerId = user.provider_id;

        res.status(200).json({ message: 'Login successful', userId: user.id });
    } catch (error) {
        res.status(400).json({ message: 'Apple authentication failed', error: error.message });
    }
});

module.exports = router;
