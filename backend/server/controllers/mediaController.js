const { Image } = require("../db/collection");
const multer = require("multer");
const path = require("path"); // Import the 'path' module
const fs = require("fs"); // Node.js file system module
const archiver = require("archiver");
const axios = require('axios');

const imageGallery = []; // A simple array to store image objects

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

// Upload an image
const uploadImage = (req, res) => {
	upload.single("image")(req, res, (err) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ message: "Error uploading file" });
		}

		const newImage = new Image();
		// inject image details into the database or perform other actions
		console.log(req.file);

		if (req.file) {
			return res.json({
				message: "File uploaded successfully",
				file: req.file,
			});
		} else {
			return res.status(400).json({ message: "No file provided" });
		}
	});
};

//insert image info into db
const insertImage = async (imageData, owner) => {
	try {
		const image = new Image(imageData);
		image.owner = owner;
		console.log(image);
		await image.save();
		return image;
	} catch (error) {
		throw error;
	}
};

// Upload multiple images
const uploadmultipleImage = (req, res) => {
    upload.array("images", 10)(req, res, async (err) => {
        let responseSent = false; // Flag to track if response has been sent

        if (err) {
            console.error(err);
            if (!responseSent) {
                responseSent = true;
				console.log(err)
                return res.status(500).json({ message: "Error uploading files" });
            }
        }

        const owner = req.user || JSON.parse(req.headers.user);

        if (req.files && req.files.length > 0) {
            try {
                for (const e of req.files) {
					console.log(req)
                    // Insert image logic here if needed
                    insertImage(e, owner);
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
                res.status(400).json({ message: "No files provided" });
            }
        }
    });
};

// Download all images
const downloadImage = (req, res) => {
	const filename = req.params.filename;
	const filePath = path.join(__dirname, "../../assets", filename); // Adjust the path as needed
	console.log(filePath);
	// Check if the file exists
	if (fs.existsSync(filePath)) {
		// Set the appropriate headers for the response
		res.setHeader(
			"Content-disposition",
			"attachment; filename=" + filename
		);
		res.setHeader("Content-type", "image/*"); // Set the appropriate MIME type based on your file type

		// Create a read stream from the file and pipe it to the response
		const fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res);
	} else {
		res.status(404).json({ message: "File not found" });
	}
	//res.status(200).json(imageGallery);
};

const downloadMulti = (req, res) => {
	const filenames = req.query.filenames; // Assuming you pass filenames as a comma-separated list in the query parameter

	if (!filenames) {
		return res.status(400).json({ message: "No filenames provided" });
	}

	const filesToDownload = filenames.split(",");

	// Set the appropriate headers for the response
	res.setHeader("Content-disposition", "attachment; filename=images.zip");
	res.setHeader("Content-type", "application/zip");

	const archive = archiver("zip", { zlib: { level: 9 } });

	// Pipe the archive to the response
	archive.pipe(res);

	// Add each file to the archive
	filesToDownload.forEach((filename) => {
		const filePath = path.join(__dirname, "../../assets", filename);

		// Check if the file exists
		if (fs.existsSync(filePath)) {
			archive.append(fs.createReadStream(filePath), { name: filename });
		} else {
			console.warn(`File not found: ${filename}`);
		}
	});

	// Finalize the archive
	archive.finalize();
};

// Modify image details
const modifyImage = (req, res) => {
	const imageId = req.params.id;
	const updatedImage = new Image();
	updatedImage.setAttributes(req.body);

	const index = imageGallery.findIndex((image) => image.getID() === imageId);
	if (index !== -1) {
		imageGallery[index] = updatedImage;
		res.status(200).json({
			message: "Image modified successfully",
			image: updatedImage,
		});
	} else {
		res.status(404).json({ message: "Image not found" });
	}
};

// Delete an image
const deleteImage = async (req, res) => {
	const imgIds = req.body.imgIds; // Assuming you pass filenames as a comma-separated list in the query parameter

	if (!imgIds) {
		return res.status(400).json({ message: "No filenames provided" });
	}

	const filesToDelete = imgIds.split(",");

	if (!filesToDelete || !Array.isArray(filesToDelete)) {
		return res.status(400).json({ message: "Invalid user IDs provided" });
	}

	const imgs = await Image.find({ _id: { $in: filesToDelete } });

	// Delete each file
	imgs.forEach((img) => {
		const filePath = path.join(__dirname, "../../assets", img.filename);

		// Check if the file exists
		if (fs.existsSync(filePath)) {
			// Delete the file
			fs.unlinkSync(filePath);
			console.log(`File deleted: ${img.filename}`);
		} else {
			console.warn(`File not found: ${img.filename}`);
		}
	});

	try {
		if (!filesToDelete || !Array.isArray(filesToDelete)) {
			return res
				.status(400)
				.json({ message: "Invalid user IDs provided" });
		}

		// Use $in operator to delete multiple img by IDs
		await Image.deleteMany({ _id: { $in: filesToDelete } });

		//res.status(200).json({ message: "Images deleted successfully" });
	} catch (error) {
		console.error("Error deleting image", error);
		res.status(500).json({ message: "Internal server error" });
	}

	res.status(200).json({
		message: "Files deleted successfully",
		filenames: imgIds,
	});
};

const getImagesByProduct = async (product) => {
	try {
	
		// Use Mongoose to find images based on the owner's ID
		const images = await Image.find({ product });
	
		return ({message : "success", data : images});
	  } catch (error) {
		console.error("Error retrieving images by product", error);
		return ({ message: "Internal server error" });
	  }
}

const getImage = async (req, res) => {
	try {
		const imgId = req.params.id;

		console.log(imgId)
	
		// Use Mongoose to find an image based on the _id field
		const image = await Image.findOne({ _id: imgId });

		if (!image) {
		  // If no image is found, send a 404 status and a message
		  res.status(404).json({ message: "Image not found" });
		  return;
		}
	
		res.status(200).json(image);

	  } catch (error) {
		console.error("Error retrieving images", error);
		res.status(500).json({ message: "Internal server error" });
	  }
}

const insertProductMedia = (product, media) => {
	
}

module.exports = {
	getImage,
	uploadImage,
	uploadmultipleImage,
	downloadImage,
	downloadMulti,
	modifyImage,
	deleteImage,
	getImagesByProduct,
};
