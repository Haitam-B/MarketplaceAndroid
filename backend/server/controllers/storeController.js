const { Store } = require("../db/collection");
const multer = require("multer");
const path = require("path"); // Import the 'path' module

// Set up storage for multer
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "assets/"); // Uploads will be stored in the 'assets/' directory
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname +
				"-" +
				uniqueSuffix +
				path.extname(file.originalname)
		);
	},
});

const upload = multer({ storage: storage });

const createOne = async (req, res) => {
    upload.single("image")(req, res, async (err) => {
        try {
            const { name, description, ownerId } = req.body;

            // Check if the store with the given name already exists
            const existingStore = await Store.findOne({ name });

            if (existingStore) {
                return res.status(400).json({ message: 'Store with this name already exists' });
            }

            // Create a new store
            const newStore = new Store({
                name,
                description,
                owner: ownerId, // Assuming ownerId is the ID of the store owner (User)
                logo: req.file.filename,
            });

            // Save the store to the database
            await newStore.save();

            res.status(201).json({ message: 'Store created successfully', store: newStore });
        } catch (error) {
            console.error('Error creating store:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
}

const removeFromStore = async (req,res) => {
    try {
        const { storeId, productId } = req.params;

        // Find the store
        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Remove the product from the store's products array
        store.products = store.products.filter(product => !product.equals(productId));

        // Update the productCount field
        store.productCount = store.products.length;

        // Save the updated store to the database
        await store.save();

        res.status(200).json({ message: 'Product removed from the store successfully', store });
    } catch (error) {
        console.error('Error removing product from store:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const addProductToStore = async (req, res) => {
    try {
        const { storeId, productId } = req.params;
        //const { name, description, price, ownerId, keyWords, theme } = req.body;

        // Find the store
        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Add the product to the store's products array
        store.products.push(productId);

        // Update the productCount field
        store.productCount = store.products.length;

        // Save the updated store to the database
        await store.save();

        res.status(201).json({ message: 'Product added to the store successfully', product: newProduct, store });
    } catch (error) {
        console.error('Error adding product to store:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
	createOne,
	removeFromStore,
    addProductToStore,
};