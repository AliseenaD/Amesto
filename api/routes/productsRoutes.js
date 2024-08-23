const express = require('express');
const router = express.Router;
const Products = require('../models/Products');
const ProductVariants = require('../models/ProductVariants');

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

// Change quantity of product
router.patch('/variants/:variantId', async (req, res) => {
    const { variantId } = req.params;
    let { quantity } = req.body;
    quantity = Number(quantity);
    // If quantity an invalid amount
    if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }
    try {
        const updatedVariant = await ProductVariants.findByIdAndUpdate(
            variantId,
            { quantity: quantity },
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
        console.error('Error updating variant quantity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Change the price of a product 
router.patch('/variants/:variantId', async (req, res) => {
    const { variantId } = req.params;
    let { price } = req.body;
    price = Number(price);
    // If price an invalid amount
    if (isNaN(price) || price < 0) {
        return res.status(400).json({ message: 'Invalid price' });
    }
    try {
        const updatedVariant = await ProductVariants.findByIdAndUpdate(
            variantId,
            { price: price },
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
router.delete('/:productId', async (req, res) => {
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
router.post('/', async (req, res) => {
    const { type, brand, model, variants } = req.body;
    // Data validation
    if (!type || !brand || !model || !variants) {
        return res.status(400).json({ message: 'Input cannot be invalid' });
    }
    try {
        const newProduct = new Products({ type, brand, model });
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