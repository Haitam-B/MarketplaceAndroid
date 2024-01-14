const express 			= require("express");
const passport 			= require("passport");
const router 			= express.Router();
const mediaController 	= require("../controllers/mediaController");
const ProductController = require("..//controllers//productController")

router.post("/add", ProductController.uploadProduct);
router.get("/store/:ownerId", ProductController.getAll);
router.get("/find/:id", ProductController.getOne);
router.get("/search", ProductController.findProduct);
router.get("/", ProductController.getProducts);
router.delete("/:id", ProductController.deleteOne);

module.exports = router;