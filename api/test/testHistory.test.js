require('dotenv').config();
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/Users');
const Products = require('../models/Products');
const router = require('../routes/orderHistoryRoutes');
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

const app = express();
app.use(express.json());
app.use('/', router);

describe('Order history API routes', () => {
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
        it('Should return all items in order history', async () => {
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

            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toHaveProperty('orderStatus', 'Pending');
        });
    });

    describe('POST /', () => {
        it('Should successfully post an order', async () => {
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
      
          const user = new User({ auth0Id: 'auth0|123456', email: 'test@example.com', name: 'Test User', role: 'Admin' });
          await user.save();
      
          const orderItem = [{ productId: product._id, quantity: 2 }];
          const res = await request(app).post('/').send({ products: orderItem });
      
          expect(res.statusCode).toBe(201);
          expect(res.body).toHaveProperty('message', 'Successfully placed order');
          
          // Wait for a short time to allow the post-save middleware to complete
          await new Promise(resolve => setTimeout(resolve, 100));
      
          // Fetch the updated user from the database
          const updatedUser = await User.findOne({ auth0Id: 'auth0|123456' });
      
          // Assert that the order has been added to the user's order history
          expect(updatedUser.orderHistory).toHaveLength(1);
          expect(updatedUser.orderHistory[0].toString()).toBe(res.body.order._id);
        });
    });

    describe('PATCH, /:orderId', () => {
        it('Should update order status', async () => {
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

            const res = await request(app).patch(`/${orderHistory._id}`).send({ processUpdate: 'Complete' });
            expect(res.statusCode).toBe(200);
            expect(res.body.order).toHaveProperty('orderStatus', 'Complete');
        });

        it('Should throw error if the process update is null or not a string', async () => {
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

            const res = await request(app).patch(`/${orderHistory._id}`).send({ });
            expect(res.statusCode).toBe(400);
            const resTwo = await request(app).patch(`/${orderHistory._id}`).send({ processUpdate: 3242423 });
            expect(resTwo.statusCode).toBe(400);
        });    

        it('Should return 404 if order id not found', async () => {
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

            const res = await request(app).patch(`/${new mongoose.Types.ObjectId()}`).send({ processUpdate: 'Complete' });
        });
    });
});