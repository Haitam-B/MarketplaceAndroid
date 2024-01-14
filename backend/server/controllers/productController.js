const { Product } = require("../db/collection");
const { Image } = require("../db/collection");
const multer = require("multer");
const path = require("path"); // Import the 'path' module
const fs = require("fs"); // Node.js file system module
const axios = require('axios');

const imageController = require(".//mediaController")

const productGallery = []; // A simple array to store product objects

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


//insert image info into db
const insertImage = async (imageData, product, isPrimary) => {
	try {
		const image = new Image(imageData);
		image.product = product._id;
		image.isPrimary = isPrimary;
		console.log(image);
		await image.save();
		return image;
	} catch (error) {
		throw error;
	}
};

// Upload an product
const uploadProduct = async (req, res) => {

	const owner = "653c4be225d2e0fa8e6f3100";

	upload.fields([{ name: 'primaryImage', maxCount: 1 }, { name: 'images', maxCount: 5 }])(req, res, async (err) => {
		// req.files contains information about the uploaded files
		const primaryImage = req.files['primaryImage'][0];
		const images = req.files['images'];
		

	//upload.array("images", 10)(req, res, async (err) => {
		const product = new Product(req.body);
		product.keyWords =  req.body.keyWords.split(',').map(keyword => keyword.trim());

		product.image = primaryImage.filename;
		
		//console.log(product);

        let responseSent = false; // Flag to track if response has been sent

		try {
		
			product.owner = owner;
			console.log(product);
			await product.save();
			//return product;
		} catch (error) {
			throw error;
		}

        if (err) {
            console.error(err);
            if (!responseSent) {
                responseSent = true;
				console.log(err)
                return res.status(500).json({ message: "Error uploading files" });
            }
        }

		if(primaryImage) {
			
			try {
				insertImage(primaryImage, product, true);
			} catch (error) {
				console.error(error);
			}
		}
        //const product = req.user || JSON.parse(req.headers.user);

        if (images && images.length > 0) {
            try {
                for (const e of images) {
					//console.log(req)
                    // Insert image logic here if needed
                    insertImage(e, product, false);
                }

                if (!responseSent) {
                    responseSent = true;
                    res.status(200).json({
                        message: "Files uploaded successfully",
                        files: req.files,
                    });
                }
            } catch (error) {
                console.error(error);
                if (!responseSent) {
                    responseSent = true;
                    res.status(500).json({ error: "Error processing images with Python API" });
                }
            }
        } else {
            if (!responseSent) {
                responseSent = true;
				console.log("No files provided")
                //res.status(400).json({ message: "No files provided" });
            }
        }

		res.status(201).json(product)
    });
};

// Construct product
const constructProduct = async (product) => {
	let images = await imageController.getImagesByProduct(product._id);
	//console.log(images)
	let imagesD = null;
	if(images.message == "success") imagesD = images.data;
	//console.log(imagesD)
	return ({ product : product, images : imagesD});
}

// Get product by ID
const getOne = async (req,res) => {
	try {
		const pId = req.params.id;

		//console.log(pId)
	
		// Use Mongoose to find an image based on the _id field
		const product = await Product.findOne({ _id: pId });

		if (!product) {
		  // If no image is found, send a 404 status and a message
		  res.status(404).json({ message: "Product not found" });
		  return;
		}

		let fp = await constructProduct(product)
		console.log(fp)
		res.status(200).json(product);

	  } catch (error) {
		console.error("Error retrieving images", error);
		res.status(500).json({ message: "Internal server error" });
	  }
}

// Search for product
const findProduct = async (req, res) => {
	const { query } = req.query;

	try {
		const products = await Product.find({
		$or: [
			{ name: { $regex: query, $options: 'i' } }, // Case-insensitive search for name
			{ keyWords: { $regex: query, $options: 'i' } }, // Case-insensitive search for keywords
			{ description: { $regex: query, $options: 'i' } }, // Case-insensitive search for theme
		],
		});
		res.json(products);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

// Get products by owner
const getAll = async (req, res) => {

	let productsList = [];
	const ownerId = req.params.ownerId;

	try {
		const products = await Product.find({ owner: ownerId });
		
		if(products.length > 0) {
			products.forEach(async p => {
				//console.log(p)
				//let finalProduct = await constructProduct(p)
				
				productsList.push(constructProduct(p));
				
				
			})
		}

		Promise.all(productsList)
			.then((results) => {
				// 'results' is an array containing the resolved values of all promises
				console.log(results);
				res.json(results);
			})
			.catch((error) => {
				// Handle any errors that occurred during the promises
				console.error(error);
			});

		console.log(productsList)
		
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

// Remove Product
const deleteOne = async (req, res) => {

	const productId = req.params.id;

	try {
		const deletedProduct = await Product.findByIdAndDelete(productId);

		if (!deletedProduct) {
		return res.status(404).json({ message: 'Product not found' });
		}

		res.json({ message: 'Product deleted successfully', deletedProduct });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}

const getProduct = async (pId) => {
	try {

		console.log(pId)
	
		// Use Mongoose to find an image based on the _id field
		const product = await Product.findOne({ _id: pId });

		if (!product) {
		  // If no image is found, send a 404 status and a message
		  return null;
		}
	
		return product;

	} catch (error) {
		console.error("Error retrieving images", error);
		return null;
	}
}

const getProducts = async (req, res) => {
	try {

		//console.log(pId)
	
		// Use Mongoose to find an image based on the _id field
		const products = await Product.find();

		if (!products) {
		  // If no image is found, send a 404 status and a message
		  return res.status(404).json({ message: 'Product not found' });
		}
	
		res.status(200).send(products);

	} catch (error) {
		console.error("Error retrieving images", error);
		res.status(500).json({ message: 'internal server error' });
	}
}

module.exports = {

	uploadProduct,
	getAll,
	getOne,
	findProduct,
	deleteOne,
	getProduct,
	getProducts,
	
};
