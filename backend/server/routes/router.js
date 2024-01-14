const express = require("express");
const passport = require("passport");
const router = express.Router();
const userController = require("../controllers/userController");
const mediaRoutes = require("./mediaRoutes");
const productRoutes = require(".//productRoutes");
const basketRoutes = require(".//basketRoutes");
const storeRoutes = require(".//storeRoutes");

//const authRoutes = require("./authRoute");

function isAuthenticated(req, res, next) {

	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

// Render registration view
router.get("/register", (req, res) => {
	res.render("register");
});

// Render login view
router.get("/login", (req, res) => {
	res.render("login");
});

// Render dashboard view
router.get("/dashboard", (req, res) => {
	//console.log(req.user);
	res.render("dashboard");
});

router.use("/product", productRoutes)
router.use("/basket", basketRoutes)
router.use("/store", storeRoutes)
//router.use("/api/user", userRoutes);
//router.use("/api/media", isAuthenticated, mediaRoutes);
router.use("/api/media", mediaRoutes);
//router.use("/auth", authRoutes);

router.post("/auth", async (req, res) => {
	let user = null
	try {
		user = await userController.getUSer(req.body.email)
	} catch (error) {
		console.log(error)
	}
	res.send(user)
})
router.get("/upload", isAuthenticated, (req, res) => {
	res.render("upload");
});

// Other media-related routes can go here

module.exports = router;
