const express 			= require("express");
const router 			= express.Router();
const storeController 	= require("../controllers/storeController");
//const storeController = require("..//controllers//productController")

router.post("/create", storeController.createOne);
router.post("/addProduct/:storeId", storeController.addProductToStore);
router.delete("/removeProduct/:storeId/:productId", storeController.removeFromStore);
//router.delete("/clear/:userId", storeController.clearBasket);

module.exports = router;