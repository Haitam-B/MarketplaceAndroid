const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model (assuming you have a User model)
        required: true,
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Reference to the Product model
        },
    ],
    productCount: {
        type: Number,
        default: 0,
    },
    logo: {
        type: String, // File path, URL, or other representation of the store's logo
    },
    // You can include additional fields based on your requirements
    // Examples: opening hours, contact information, ratings, etc.
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps to the document
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
