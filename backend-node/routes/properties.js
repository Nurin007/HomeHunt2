const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware to verify token
function authMiddleware(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
}

// Get all properties
router.get('/', async (req, res) => {
    try {
        const [properties] = await db.query('SELECT p.*, u.name as seller_name FROM properties p JOIN users u ON p.seller_id = u.id ORDER BY p.created_at DESC');
        res.json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a property (Sellers and Admins only)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role === 'buyer') {
        return res.status(403).json({ error: 'Access denied. Buyers cannot add properties.' });
    }

    try {
        const { title, description, price, location, image_url } = req.body;
        
        if (!title || !description || !price || !location) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        const [result] = await db.query(
            'INSERT INTO properties (seller_id, title, description, price, location, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, title, description, price, location, image_url || null]
        );

        res.status(201).json({ message: 'Property added successfully', propertyId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a property
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const propertyId = req.params.id;
        
        // Check if property exists and user owns it (or is admin)
        const [properties] = await db.query('SELECT * FROM properties WHERE id = ?', [propertyId]);
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const property = properties[0];
        if (property.seller_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this property' });
        }

        await db.query('DELETE FROM properties WHERE id = ?', [propertyId]);
        res.json({ message: 'Property removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
