const dotenv = require('dotenv');
dotenv.config();  // Load environment variables
const express = require('express');
const router = express.Router();
const { auth } = require('express-oauth2-jwt-bearer');
const OrderHistory = require('../models/OrderHistory');
const User = require('../models/Users');

// Auth0 middleware
const requireAuth = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER,
    tokenSigningAlg: 'RS256',
});

// Middleware to check if a user is admin
const checkAdmin = (req, res, next) => {
    const roles = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/roles`];
    if (roles && roles.includes('Admin')) {
        next();
    }
    else {
        res.status(403).send('Access denied');
    }
};

// Get all order history
router.get('/', requireAuth, checkAdmin, async (req, res) => {
    try {
        const orders = await OrderHistory.find();
        res.json(orders);
    }
    catch (error) {
        console.error('Error retrieving all order history', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a new order to order history
router.post('/', requireAuth, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
    const { products } = req.body;
    if (!products) {
        return res.status(400).json({ error: 'Invalid products' });
    }
    try {
        const user = await User.findOne({ auth0Id });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const newOrder = new OrderHistory({
            userId: user._id,
            products: products,
            orderDate: Date.now(),
            orderStatus: 'Pending'
        });
        const savedOrder = await newOrder.save();
        res.status(201).json({ message: 'Successfully placed order', order: savedOrder });
    }
    catch (error) {
        console.error('Error adding new order', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}); 

// Mark order as complete
router.patch('/:orderId', requireAuth, checkAdmin, async (req, res) => {
    const { orderId } = req.params;
    const { processUpdate } = req.body;
    // Data validation
    if (!processUpdate || typeof processUpdate !== 'string') {
        return res.status(400).json({ error: 'Invalid process update' });
    }
    try {
        const updatedOrder = await OrderHistory.findByIdAndUpdate(
            orderId,
            { orderStatus: processUpdate },
            { new: true, runValidators: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Successfully updated order status', order: updatedOrder });
    }
    catch (error) {
        console.error('Error updating order', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;