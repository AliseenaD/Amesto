const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    auth0Id: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ['Admin', 'Basic'] },
    email: { type: String, required: true, unique: true },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderHistory' }],
    shoppingCart: [
       {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
            quantity: { type: Number, required: true, min: 1 }
       }
    ]
});

module.exports = mongoose.model('Users', userSchema);