const express 			= require("express");
const passport 			= require("passport");
const router 			= express.Router();
const mediaController 	= require("../controllers/mediaController");
//const imageController 	= require("../controllers/imageController");
/*
const uploadImage 			= imageController.uploadImage;
const uploadmultipleImage 	= imageController.uploadmultipleImage;
const downloadImage 		= imageController.downloadImage;
const downloadMultiImage 	= imageController.downloadMulti;
const deleteImage			= imageController.deleteImage;
const getImagesByUser		= imageController.getImagesByUser;
const getImage				= imageController.getImage;*/

function isAuthenticated(req, res, next) {
	console.log('user', req.user)
	console.log(req);
	if (req.isAuthenticated()) {
		return next();
	}
	console.log(req)
	res.send("not auth");
}

// JWT authentication
function isJwtAuthenticated(req, res, next) {
	passport.authenticate('jwt', { session: false }, function (err, user, info) {
		//console.log(req)
		console.log('Received token:', req.headers.authorization); // Log the received token
	  if (err) {
		console.log(err);
		return res.status(500).json({ error: 'Internal Server Error' });
	  }
  
	  if (!user) {
		// User not authenticated
		return res.status(401).json({ message: 'Unauthorized' });
	  }
  
	  // User authenticated, proceed to the next middleware
	  return next();
	})(req, res, next);
  }

/*
router.post("/upload",isAuthenticated, uploadImage);
//router.post("/uploadMulti", isAuthenticated, uploadmultipleImage);
router.post("/uploadMulti", uploadmultipleImage);

router.post("/delete", deleteImage);
router.get("/download/:filename", downloadImage);
router.get("/downloadMulti", isAuthenticated, downloadMultiImage);
router.get("/getImgs", getImagesByUser);
router.get("/getOneImg/:id", getImage);
*/

// Other media-related routes can go here

module.exports = router;
