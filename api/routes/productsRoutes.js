const express = require('express');
const router = express.Router();
const { auth } = require('express-oauth2-jwt-bearer');
const Products = require('../models/Products');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { storage } = require('../config/firebase'); // Import initalized firebase storage
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { bucket } = require('../config/firebaseAdmin');
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

// Get product variants by ID
router.get('/variants/:variantId', async (req, res) => {
    const { variantId } = req.params;
    if (!variantId) {
        return res.status(400).json({ error: 'Invalid variant ID' });
    }
    try {
        const variant = await ProductVariants.findById(variantId);
        if (variant) {
            res.json(variant);
        }
        else {
            res.status(404).json({ error: 'Variant not found' });
        }
    }
    catch (error) {
        console.error('Error fetching the variant:', error);
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
    if (!type || !brand || !model || !variants || !req.file) {
        return res.status(400).json({ message: 'Input cannot be invalid' });
    }
    try {
        const file = req.file;
        const fileName = `${uuidv4()}_${file.originalname}`;
        const fileUpload = bucket.file(`product_images/${fileName}`);
    
        const blobStream = fileUpload.createWriteStream({
            metadata: {
            contentType: file.mimetype
          }
        });
    
        blobStream.on('error', (error) => {
            console.error('Error uploading to Firebase Storage:', error);
            res.status(500).json({ message: 'Error uploading file' });
        });
    
        blobStream.on('finish', async () => {
            // Make the file public
            await fileUpload.makePublic();

            // Get the public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

            // Create new product
            const newProduct = new Products({ type, brand, model, storage: Number(storageSize), picture: publicUrl });
            let parsedVariants;
            try {
                parsedVariants = JSON.parse(variants);
            } catch (error) {
                console.error('Error parsing variants:', error);
                return res.status(400).json({ message: 'Invalid variants data' });
            }

            if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
                for (const variant of parsedVariants) {
                    const newVariant = new ProductVariants({
                        color: variant.color,
                        price: Number(variant.price),
                        quantity: Number(variant.quantity),
                        productId: newProduct._id
                    });
                    const savedVariant = await newVariant.save();
                
                    // Add the saved variant's ID to the product's variants array
                    newProduct.variants.push(savedVariant._id);
                }
            }
            await newProduct.save();
            res.status(201).json({ message: 'Successfully created a new product' });
        });
    
        blobStream.end(file.buffer);
    } catch (error) {
        console.error('Error creating a new product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;