const mongoose = require('mongoose');

const productsSchema = mongoose.Schema({
    type: { type: String, required: true, unique: false },
    brand: { type: String, required: true, unique: false },
    model: { type: String, required: true, unique: false },
    storage: { type: Number, required: false, unique: false },
    picture: { type: String, required: true, unique: false },
    variants: [{ type: mongoose.Schema.ObjectId, ref: 'ProductVariants' }],
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Middleware to exclude soft-deleted products from queries
productsSchema.pre(['find', 'findOne', 'findById'], function() {
    this.where({ isDeleted: false });
});

// Soft Deleting a product
productsSchema.methods.softDelete = function() {
    this.isDeleted = true;
    return this.save();
}

// Static method to find deleted products
productsSchema.statics.findDeleted = function() {
    return this.find({ isDeleted: true });
};

module.exports = mongoose.model('Products', productsSchema);