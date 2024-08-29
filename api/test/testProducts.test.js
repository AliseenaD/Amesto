require('dotenv').config();
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/Users');
const Products = require('../models/Products');
const router = require('../routes/productsRoutes');
const { isThisQuarter } = require('date-fns');
const ProductVariants = require('../models/ProductVariants');
const OrderHistory = require('../models/OrderHistory');

// Mock the Auth0 middleware
jest.mock('express-oauth2-jwt-bearer', () => ({
    auth: () => (req, res, next) => {
        req.auth = {
            payload: {
                sub: 'auth0|123456',
                [`${process.env.AUTH0_AUDIENCE}/email`]: 'test@example.com',
                [`${process.env.AUTH0_AUDIENCE}/name`]: 'Test User',
                [`${process.env.AUTH0_AUDIENCE}/roles`]: ['Admin']
            }
        };
        next();
    }
}));

// Mock firebase app
jest.mock('firebase/app', () => {
    const mockStorage = {
        ref: jest.fn(() => ({
        child: jest.fn(() => ({
            put: jest.fn().mockResolvedValue({
                ref: jest.fn().mockResolvedValue('https://mocked-image-url.com/test-image.jpg')
            })
        }))
        }))
    };

    return {
        initializeApp: jest.fn(() => ({})),
        getApp: jest.fn().mockReturnValue({}),
        getStorage: jest.fn(() => mockStorage)
    };
});
  
// Mock firebase storage
jest.mock('firebase/storage', () => {
    const mockStorageRef = {
        put: jest.fn().mockResolvedValue({
            ref: {
                getDownloadURL: jest.fn().mockResolvedValue('https://mocked-image-url.com/test-image.jpg')
            }
        }),
    };

    const mockStorage = {
        ref: jest.fn().mockReturnValue(mockStorageRef)
    };

    return {
        getStorage: jest.fn(() => mockStorage),
        ref: jest.fn((storage, path) => mockStorageRef),  // Adjust ref to return the mockStorageRef
        uploadBytes: jest.fn().mockResolvedValue(),
        getDownloadURL: jest.fn().mockResolvedValue('https://mocked-image-url.com/test-image.jpg')
    };
});

const app = express();
app.use(express.json());
app.use('/', router);

describe('Product API routes', () => {
    // Connect before start
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    });
    // Disconnect after end
    afterAll(async () => {
        await User.deleteMany({});
        await Products.deleteMany({});
        await OrderHistory.deleteMany({});
        await ProductVariants.deleteMany({});
        await mongoose.connection.close();
    });
    // Delete everything in table before each
    beforeEach(async() => {
        await User.deleteMany({});
        await Products.deleteMany({});
        await OrderHistory.deleteMany({});
        await ProductVariants.deleteMany({});
    });

    describe('GET /', () => {
        it('Should return list of all products', async () => {
            const variant = new ProductVariants({
                productId: new mongoose.Types.ObjectId(),  // Generate a new ObjectId
                color: '#FF5733',
                price: 699.99,
                quantity: 150   
            });
            const product = new Products({ 
                type: 'Phone',
                brand: 'Apple',
                model: 'iPhone 12',
                storage: 128,
                picture: 'testImage',
                variants: [variant._id],
                isDeleted: false,
                createdAt: "2024-08-26T15:00:00Z",
                updatedAt: "2024-08-26T15:00:00Z"
            });
            await product.save();
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body[0]).toHaveProperty('model', 'iPhone 12');
        });

        it('Should only be returning nondeleted items', async() => {
            const variant2 = new ProductVariants({
                productId: new mongoose.Types.ObjectId(),  // Generate a new ObjectId
                color: '#F6F6F6',
                price: 699.99,
                quantity: 150   
            });
            const product2 = new Products({ 
                type: 'Phone',
                brand: 'Apple',
                model: 'iPhone 12',
                storage: 128,
                picture: 'testImage',
                variants: [variant2._id],
                isDeleted: true,
                createdAt: "2024-08-26T15:00:00Z",
                updatedAt: "2024-08-26T15:00:00Z"
            });
            await product2.save();
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(0);
        });
    });

    describe('GET /:productId', () => {
        it('Should return specific product information', async () => {
            const variant = new ProductVariants({
                productId: new mongoose.Types.ObjectId(),  // Generate a new ObjectId
                color: '#FF5733',
                price: 699.99,
                quantity: 150   
            });
            const product = new Products({ 
                type: 'Phone',
                brand: 'Apple',
                model: 'iPhone 12',
                storage: 128,
                picture: 'testImage',
                variants: [variant._id],
                isDeleted: false,
                createdAt: "2024-08-26T15:00:00Z",
                updatedAt: "2024-08-26T15:00:00Z"
            });
            await product.save();

            const res = await request(app).get(`/${product._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('model', 'iPhone 12');
        });

        it('Should return 404 if product not found', async () => {
            const variant = new ProductVariants({
                productId: new mongoose.Types.ObjectId(),  // Generate a new ObjectId
                color: '#FF5733',
                price: 699.99,
                quantity: 150   
            });
            const product = new Products({ 
                type: 'Phone',
                brand: 'Apple',
                model: 'iPhone 12',
                storage: 128,
                picture: 'testImage',
                variants: [variant._id],
                isDeleted: false,
                createdAt: "2024-08-26T15:00:00Z",
                updatedAt: "2024-08-26T15:00:00Z"
            });
            await product.save();

            const invalidId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/${invalidId}`);
            expect(res.statusCode).toBe(404);
        });
    });
    
    describe('PATCH /variants/:variantId', () => {
        it('Should update variant quantity', async () => {
            const product = new Products({ 
                type: 'Phone',
                brand: 'Apple',
                model: 'iPhone 12',
                storage: 128,
                picture: 'testImage',
            });
            await product.save();

            const variant = new ProductVariants({
                productId: product._id,
                color: '#FF5733',
                price: 699.99,
                quantity: 100
            });
            await variant.save();

            const res = await request(app).patch(`/variants/${variant._id}`).send({ quantity: 150 });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('quantity', 150);
        }); 

        it('Should update variant price', async () => {
            const product = new Products({ 
                type: 'Phone',
                brand: 'Apple',
                model: 'iPhone 12',
                storage: 128,
                picture: 'testImage',
            });
            await product.save();

            const variant = new ProductVariants({
                productId: product._id,
                color: '#FF5733',
                price: 699.99,
                quantity: 100
            });
            await variant.save();

            const res = await request(app).patch(`/variants/${variant._id}`).send({ price: 150 });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('price', 150);
        });
    });

    describe('DELETE /:productId', () => {
        it('Should delete a product based on id', async () => {
            const product = new Products({ 
                type: 'Phone',
                brand: 'Apple',
                model: 'iPhone 12',
                storage: 128,
                picture: 'testImage',
            });
            await product.save();

            const res = await request(app).delete(`/${product._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Product has been soft deleted');
        });

        it('Should return error if product not found', async () => {
            const product = new Products({ 
                type: 'Phone',
                brand: 'Apple',
                model: 'iPhone 12',
                storage: 128,
                picture: 'testImage',
            });
            await product.save();

            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).delete(`/${fakeId}`);
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('message', 'Product not found');
        });
    }); 

    describe('POST /', () => {
        it('Should post a new product with an image URL', async () => {
            const newProduct = {
                type: 'Phone',
                brand: 'Samsung',
                model: 'Galaxy S21',
                storage: 256,
                variants: [
                    { color: '#000000', price: 799.99, quantity: 100 },
                    { color: '#FFFFFF', price: 799.99, quantity: 100 }
                ]
            };

            const res = await request(app)
                .post('/')
                .field('type', newProduct.type)
                .field('brand', newProduct.brand)
                .field('model', newProduct.model)
                .field('storage', newProduct.storage)
                .field('variants[0][color]', newProduct.variants[0].color)
                .field('variants[0][price]', newProduct.variants[0].price)
                .field('variants[0][quantity]', newProduct.variants[0].quantity)
                .field('variants[1][color]', newProduct.variants[1].color)
                .field('variants[1][price]', newProduct.variants[1].price)
                .field('variants[1][quantity]', newProduct.variants[1].quantity)
                .attach('image', Buffer.from('mocked-image-content'), 'test-image.jpg');

            expect(res.statusCode).toBe(201);

            const savedProduct = await Products.findOne({ model: 'Galaxy S21' });
            expect(savedProduct).not.toBeNull();
            console.log(savedProduct);
            expect(savedProduct.picture).toBeDefined();

            const variants = await ProductVariants.find({ productId: savedProduct._id });
            expect(variants).toHaveLength(2);
        });

        it('should throw error if a path is missing', async () => {
            const newProduct = {
                type: 'Phone',
                brand: 'Samsung',
                storage: 256,
                variants: [
                    { color: '#000000', price: 799.99, quantity: 100 },
                    { color: '#FFFFFF', price: 799.99, quantity: 100 }
                ]
            };
            const res = await request(app).post('/').send(newProduct);
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Input cannot be invalid');
        });
    });
});