const express = require('express');
const router = express.Router();
const { auth } = require('express-oauth2-jwt-bearer');
const Products = require('../models/Products');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { storage } = require('../config/firebase'); // Import initalized firebase storage
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const ProductVariants = require('../models/ProductVariants');

// Multer setup for handling file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // limit file size to 10MB
    }
})

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

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Products.find();
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching the products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get product by id
router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        return res.status(400).json({ error: 'Invalid Product ID' });
    }
    try {
        const product = await Products.findById(productId);
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).json({ message: 'Product not found' });
        }
    }
    catch (error) {
        console.error('Error fetching the product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Change the price or quantity of a product 
// ONLY FOR ADMIN FUNCTIONALITY
router.patch('/variants/:variantId', requireAuth, checkAdmin, async (req, res) => {
    const { variantId } = req.params;
    let { price, quantity } = req.body; 
    // If price an invalid amount
    if ((price !== undefined && (isNaN(price) || price < 0)) || 
        (quantity !== undefined && (isNaN(quantity) || quantity < 0))) {
        return res.status(400).json({ message: 'Invalid price or quantity' });
    }
    try {
        const updateData = {};
        if (price !== undefined) updateData.price = price;
        if (quantity !== undefined) updateData.quantity = quantity;
        const updatedVariant = await ProductVariants.findByIdAndUpdate(
            variantId,
            updateData,
            { new: true, runValidators: true }
        );
        if (updatedVariant) {
            res.json(updatedVariant);
        }
        else {
            res.status(404).json({ message: 'Variant not found' });
        }
    }
    catch (error) {
        console.error('Error updating variant price:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a product
// ONLY FOR ADMIN FUNCTIONALITY
router.delete('/:productId', requireAuth, checkAdmin, async (req, res) => {
    const { productId } = req.params;
    try {
        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await product.softDelete();
        res.json({ message: 'Product has been soft deleted' });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Add a new product 
// ONLY FOR ADMIN FUNCTIONALITY
router.post('/', requireAuth, checkAdmin, upload.single('image'), async (req, res) => {
    const { type, brand, model, storage: storageSize, variants } = req.body;
    // Data validation
    if (!type || !brand || !model || !storage || !variants || !req.file) {
        return res.status(400).json({ message: 'Input cannot be invalid' });
    }
    try {
        // Upload photo portion of post
        const file = req.file;
        const fileName = `${uuidv4()}_${file.originalname}`;
        const fileRef = ref(storage, `product_images/${fileName}`);
        // Upload the file to Firebase Storage
        await uploadBytes(fileRef, file.buffer, { contentType: file.mimetype });
        // Get the public URL of the uploaded file
        const publicUrl = await getDownloadURL(fileRef);

        // Create new product
        const newProduct = new Products({ type, brand, model, storage: Number(storageSize), picture: publicUrl });
        const savedProduct = await newProduct.save();
        // Create and save product variants if provided
        if (variants && variants.length > 0) {
            // Attach productId to each variant and save
            const variantPromises = variants.map(variant => {
                const newVariant = new ProductVariants({
                    ...variant,
                    productId: savedProduct._id
                });
                return newVariant.save();
            });
            await Promise.all(variantPromises);
        }
        res.status(201).json({ message: 'Successfully created a new product' });
    }
    catch (error) {
        console.error('Error creating a new product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;