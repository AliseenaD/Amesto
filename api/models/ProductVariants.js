const mongoose = require('mongoose');

const productVariantsSchema = mongoose.Schema({
    productId: { type: mongoose.Schema.ObjectId, ref: 'Products', required: true },
    color: { type: String, match: /^#([0-9A-F]{3}){1,2}$/i, required: false },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 }
});

module.exports = mongoose.model('ProductVariants', productVariantsSchema);