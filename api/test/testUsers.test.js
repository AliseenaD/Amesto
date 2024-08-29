const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/Users');
const Products = require('../models/Products');
const router = require('../routes/usersRoutes');
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
                [`${process.env.AUTH0_AUDIENCE}/roles`]: ['Basic']
            }
        };
        next();
    }
}));

const app = express();
app.use(express.json());
app.use('/', router);

describe('User API routes', () => {
    // Connect before start
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    });
    // Disconnect after end
    afterAll(async () => {
        await mongoose.connection.close();
    });
    // Delete everything in table before each
    beforeEach(async() => {
        await User.deleteMany({});
        await Products.deleteMany({});
        await OrderHistory.deleteMany({});
        await ProductVariants.deleteMany({});
    });
    // Delete everything after each 
    afterEach(async() => {
        await User.deleteMany({});
        await Products.deleteMany({});
        await OrderHistory.deleteMany({});
        await ProductVariants.deleteMany({});
    });

    describe('POST /verify-user', () => {
        it('Should create a new user if if not exists', async () => {
            const res = await request(app).post('/verify-user');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('user.auth0Id', 'auth0|123456');
            expect(res.body).toHaveProperty('created', true);
        });

        it('Should return user if already in table', async () => {
            const user = new User({ auth0Id: 'auth0|123456', email: 'test@example.com', name: 'Test User', role: 'Basic' });
            await user.save();
            const res = await request(app).post('/verify-user');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('user.auth0Id', 'auth0|123456');
            expect(res.body).toHaveProperty('created', false);
        });
    });

    describe('GET /', () => {
        it('Should return users that are in the table', async() => {
            const user = new User({ auth0Id: 'auth0|123456', email: 'test@example.com', name: 'Test User', role: 'Basic' });
            await user.save();
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('email', 'test@example.com');
        });
        it('Should return error if user is not found', async() => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('PATCH /cart', () => {
        it('Should add a new item to cart', async () => {
            const user = new User({ auth0Id: 'auth0|123456', email: 'test@example.com', name: 'Test User', role: 'Basic' });
            await user.save();

            const variant = new ProductVariants({
                productId: new mongoose.Types.ObjectId(),  // Generate a new ObjectId
                color: '#FF5733',
                price: 699.99,
                quantity: 150   
            });
            await variant.save();

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

            const res = await request(app).patch('/cart').send({ productId: product._id, quantity: 2 });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toHaveProperty('quantity', 2);
        });

        it('Should still only have length one if same product', async () => {
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
            const user = new User({ auth0Id: 'auth0|123456', name: 'Test User', email: 'test@example.com', role: 'Basic' });
            await user.save();
            const res = await request(app)
            .patch('/cart')
            .send({ productId: product._id, quantity: 2 });
            const resTwo = await request(app)
            .patch('/cart')
            .send({ productId: product._id, quantity: 5 });
            expect(resTwo.statusCode).toBe(200);
            expect(resTwo.body).toHaveLength(1);
            expect(resTwo.body[0]).toHaveProperty('quantity', 5);
        });
    });
    
    describe('DELETE /cart/:productId', () => {
        it('Should delete an item from the cart when found', async () => {
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
            const user = new User({ auth0Id: 'auth0|123456', name: 'Test User', email: 'test@example.com', role: 'Basic' });
            await user.save();
            await request(app).patch('/cart').send({ productId: product._id, quantity: 2 });
            const res = await request(app).delete(`/cart/${product._id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Product removed from cart');
            expect(res.body.shoppingCart).toHaveLength(0);
        });
        
        it('Should throw error if item not found in the cart', async () => {
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
            const user = new User({ auth0Id: 'auth0|123456', name: 'Test User', email: 'test@example.com', role: 'Basic' });
            await user.save();
            await request(app).patch('/cart').send({ productId: product._id, quantity: 2 });
            const res = await request(app).delete('/cart/48274824');
            expect(res.statusCode).toBe(404);
        });

        /*
        it('Should throw error if product id is invalid', async () => {
            const user = new User({ auth0Id: 'auth0|123456', name: 'Test User', email: 'test@example.com', role: 'Basic' });
            await user.save();
          
            // Test with an empty string as productId
            const res = await request(app).delete('/cart/');
          
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Invalid product ID');
        });
        */
    });

    describe('GET /cart', () => {
        it('Should return all elements in shopping cart', async () => {
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
            const user = new User({ auth0Id: 'auth0|123456', name: 'Test User', email: 'test@example.com', role: 'Basic' });
            await user.save();
            await request(app).patch('/cart').send({ productId: product._id, quantity: 2 });
            const res = await request(app).get('/cart');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
        });

        it('Should not include soft deleted items in shopping cart', async () => {
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
                isDeleted: true,
                createdAt: "2024-08-26T15:00:00Z",
                updatedAt: "2024-08-26T15:00:00Z"
            });
            await product.save();
            const user = new User({ auth0Id: 'auth0|123456', name: 'Test User', email: 'test@example.com', role: 'Basic' });
            await user.save();
            const addToCartRes = await request(app).patch('/cart').send({ productId: product._id, quantity: 2 });
            expect(addToCartRes.statusCode).toBe(500);
            const res = await request(app).get('/cart');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(0);
        });
    });

    describe('GET /order-history', () => {
        it('Should return the order history for a user', async () => {
            // Create a product and its variant
            const variant = new ProductVariants({
                productId: new mongoose.Types.ObjectId(),
                color: '#FF5733',
                price: 699.99,
                quantity: 150
            });
            await variant.save();
    
            const product = new Products({ 
                type: 'Phone',
                brand: 'Apple',
                model: 'iPhone 12',
                storage: 128,
                picture: 'testImage',
                variants: [variant._id],
                isDeleted: false
            });
            await product.save();
    
            // Create an order history entry
            const orderHistory = new OrderHistory({
                userId: new mongoose.Types.ObjectId(),
                products: [{
                    productId: product._id,
                    quantity: 1,
                    price: 699.99
                }],
                totalAmount: 699.99,
                orderDate: new Date()
            });
            await orderHistory.save();
    
            // Create a user with the order history
            const user = new User({
                auth0Id: 'auth0|123456',
                name: 'Test User',
                email: 'test@example.com',
                role: 'Basic',
                orderHistory: [orderHistory._id]
            });
            await user.save();
    
            // Make the request
            const res = await request(app).get('/order-history');
    
            // Assertions
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toHaveProperty('_id', orderHistory._id.toString());
            expect(res.body[0].products[0]).toHaveProperty('productId._id', product._id.toString());
            expect(res.body[0].products[0]).toHaveProperty('quantity', 1);
        });
    
        it('Should return 404 if user is not found', async () => {
            // Ensure no user exists with the auth0Id that the mock middleware provides
            await User.deleteMany({ auth0Id: 'auth0|123456' });
    
            const res = await request(app).get('/order-history');
    
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', 'User not found');
        });
    });
});