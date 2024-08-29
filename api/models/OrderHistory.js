const mongoose = require('mongoose');
const Users = require('./Users');

const orderHistorySchema = mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, ref: 'Users', required: true },
    products: [
        {
            productId: { type: mongoose.Schema.ObjectId, ref: 'Products', required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ],
    orderDate: { type: Date, default: Date.now },
    orderStatus: { type: String, default: 'Pending' }
}); 

// Post save middleware
orderHistorySchema.post('save', async function(doc) {
    try {
        const user = await Users.findById(doc.userId);
        if (user) {
            user.orderHistory.push(doc._id);
            await user.save();
        }
    }
    catch (error) {
        console.error('Error updating user order history', error);
    }
});

module.exports = mongoose.model('OrderHistory', orderHistorySchema);