const dotenv = require('dotenv');
dotenv.config();  // Load environment variables
const express = require('express');
const router = express.Router();
const { auth } = require('express-oauth2-jwt-bearer');
const User = require('../models/Users');
const Products = require('../models/Products');
const ProductVariants = require('../models/ProductVariants');

// Auth0 middleware
const requireAuth = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER,
    tokenSigningAlg: 'RS256',
})

// Verify user route
router.post('/verify-user', requireAuth, async (req, res) => {
    try {
        const auth0Id = req.auth.payload.sub;
        const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
        // Roles might not be present, so we'll use a default if it's not there
        const roles = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/roles`] || ['user'];

        let user = await User.findOne({ auth0Id });
        if (user) {
            res.json({ user, created: false });
        }
        else {
            const newUser = new User({
                auth0Id,
                email,
                role: roles[0]
            });
            await newUser.save();
            res.json({ user: newUser, created: true });
        }
    }
    catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ error: error.message || 'internal server error' });
    }
});

// Get profile
router.get('/', requireAuth, async (req, res) => {
    try {
        const user = await User.findOne({ auth0Id: req.auth.payload.sub });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error retreiving the user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete an item from the shopping cart
router.delete('/cart', requireAuth, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
    const { productId, variantId } = req.body;
    if (!productId || !variantId) {
        return res.status(400).json({ error: 'Invalid product ID or variant ID' });
    }
    try {
        const user = await User.findOne({ auth0Id });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedCart = user.shoppingCart.filter(item => item.productId.toString() !== productId && item.variantId.toString() !== variantId);
        if (updatedCart.length === user.shoppingCart.length) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }
        user.shoppingCart = updatedCart;
        await user.save();
        res.json({ message: 'Product removed from cart', shoppingCart: user.shoppingCart });
    }
    catch (error) {
        console.error('Error deleting product from shopping cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update quantity or add an item to shopping cart
router.patch('/cart', requireAuth, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
    const { productId, variantId, quantity } = req.body;
    // Data validation
    if (!productId || !variantId || !quantity || quantity < 1) {
        return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }
    try {
        const user = await User.findOne({ auth0Id });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartItemIndex = user.shoppingCart.findIndex(item => 
            item.productId.toString() === productId && item.variantId.toString() === variantId
        );
        // If product in cart update index
        if (cartItemIndex > -1) {
            user.shoppingCart[cartItemIndex].quantity = quantity;
        }
        // Otherwise push new item onto shopping cart
        else {
            // Throw error if product is deleted
            const product = await Products.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            if (product.isDeleted) {
                return res.status(404).json({ error: 'Product was deleted' });
            }
            // Verify the variant exists and belongs to the product
            const variant = await ProductVariants.findById(variantId);
            if (!variant || variant.productId.toString() !== productId) {
                return res.status(400).json({ error: 'Invalid product variant' });
            }

            user.shoppingCart.push({ productId, variantId, quantity });
        }
        await user.save();
        res.json(user.shoppingCart);
    }
    catch (error) {
        console.error('Error adding product to shopping cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get the users shopping cart
router.get('/cart', requireAuth, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
    try {
        const user = await User.findOne({ auth0Id })
        .populate({
            path: 'shoppingCart.productId',
            model: Products,
            select: '-variants' // Exclude the variants array from the product
        })
        .populate({
            path: 'shoppingCart.variantId',
            model: ProductVariants
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Filter out soft deleted products
        const activeCart = user.shoppingCart.filter(item => !item.productId.isDeleted);
        res.json(activeCart);
    }
    catch (error) {
        console.error('Error getting shopping cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get the users order history
router.get('/order-history', requireAuth, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
    try {
        const user = await User.findOne({ auth0Id }).populate({
            path: 'orderHistory',
            populate: {
                path: 'products.productId',
                model: 'Products'
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userHistory = user.orderHistory;
        res.json(userHistory);
    }
    catch (error) {
        console.error('Error getting order history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;