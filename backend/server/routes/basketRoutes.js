const express 			= require("express");
const router 			= express.Router();
const basketController 	= require("../controllers/basketController");
//const basketController = require("..//controllers//productController")

router.post("/addProduct", basketController.addProduct);
router.delete("/remove/:userId/:productId", basketController.removeFromBasket);
router.delete("/clear/:userId", basketController.clearBasket);

module.exports = router;