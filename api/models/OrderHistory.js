const mongoose = require('mongoose');

const orderHistorySchema = mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'Users', required: true },
    products: [
        {
            productId: { type: mongoose.Schema.ObjectId, ref: 'Products', required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ],
    orderDate: { type: Date, default: Date.now() },
    orderStatus: { type: String, default: 'Pending' }
}); 

module.exports = mongoose.model('OrderHistory', orderHistorySchema);