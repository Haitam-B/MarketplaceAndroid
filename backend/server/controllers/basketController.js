const { Product, Basket } = require("../db/collection");
const path = require("path"); // Import the 'path' module
const fs = require("fs"); // Node.js file system module
const axios = require('axios');

const productController = require(".//productController")

const addProduct = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Check if the user's basket exists
        let basket = await Basket.findOne({ userId });

        if (!basket) {
            // Create a new basket if it doesn't exist
            basket = new Basket({ userId });
            console.log(userId)
            basket.userId = userId;
            await basket.save();
        }

        // Add the product to the basket
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the product is already in the basket
        const existingProduct = basket.products.find(p => p.productId.equals(productId));

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            basket.products.push({ productId, quantity });
        }

        await basket.save();

        res.status(200).json({ message: 'Product added to the basket successfully' });
    } catch (error) {
        console.error('Error adding product to basket:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const removeFromBasket = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        // Find the user's basket
        const basket = await Basket.findOne({ userId });

        if (!basket) {
            return res.status(404).json({ message: 'Basket not found' });
        }

        // Remove the product from the basket
        basket.products = basket.products.filter(product => !product.productId.equals(productId));

        await basket.save();

        res.status(200).json({ message: 'Product removed from the basket successfully' });
    } catch (error) {
        console.error('Error removing product from basket:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const clearBasket = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user's basket
        const basket = await Basket.findOne({ userId });

        if (!basket) {
            return res.status(404).json({ message: 'Basket not found' });
        }

        // Clear the entire basket
        basket.products = [];

        await basket.save();

        res.status(200).json({ message: 'Basket cleared successfully' });
    } catch (error) {
        console.error('Error clearing basket:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {

	addProduct,
    removeFromBasket,
    clearBasket,
	
};