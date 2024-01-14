const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // Import the 'path' module
const bcrypt = require("bcrypt");
const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const { User } = require("./server/db/collection");
const connDB = require("./server/db/connection");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Use cors
const corsOptions = {   origin: '*', // Replace with your Angular app's domain   
						methods: '*',
						allowedHeaders: '*',
					 };  
app.use(cors(corsOptions));


app.use(express.static(path.join(__dirname, 'assets')));
//app.use(express.static(path.join(__dirname, 'assets/imageInfo')));

// Express session
app.use(
	session({
		secret: "your-secret-key",
		resave: true,
		saveUninitialized: true,
	})
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//authentication
passport.use(
	new LocalStrategy(
		{
			usernameField: "email",
			passwordField: "password",
		},
		async (email, password, done) => {
			try {
				const user = await User.findOne({ email });

				if (!user) {
					return done(null, false, { message: "Incorrect email." });
				}
				return done(null, user);
			} catch (error) {
				return done(error);
			}
		}
	)
);

// JWT authentication strategy
const jwtOpts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: 'your-secret-key', // Replace with your actual secret key
  };

  passport.use(new JwtStrategy(jwtOpts, async (jwtPayload, done) => {
	try {
	  console.log('Payload:', jwtPayload);
	  const userId = jwtPayload.sub; // Adjust the key based on the payload structure
	  console.log('uid:', userId);
  
	  const user = await User.find({ _id: userId });
	  console.log('User:', user);
  
	  if (!user) {
		return done(null, false);
	  }
  
	  return done(null, user);
	} catch (error) {
	  return done(error);
	}
  }));
  


// Passport serialize and deserialize user
passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
	console.log(id);
	try {
		const objectId = new mongoose.Types.ObjectId(id);
		const user = await User.findById(objectId);
		done(null, user);
	} catch (error) {
		done(error);
	}
});

// Log requests
app.use(morgan("common"));



//mongoose conn
connDB();

//parssing middleware
//Parse application/x-www-form-utlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//Parse application/json
app.use(bodyParser.json());

app.set("view engine", "ejs"); // Set the view engine to EJS
app.set("views", path.join(__dirname, "views")); // Set the views directory

// Create a virtual path for public folder
app.use("/static", express.static("public"));
app.use("/samples", express.static("images"));

//Router

const navRoutes = require("./server/routes/router");


app.use("/", navRoutes);

app.get('/imageData/:imgName', (req, res) => {
	const filename = req.params.imgName + '.json';
	const filePath = path.join(__dirname, 'assets', 'imageInfo', filename);
	console.log(filePath)
  
	// Send the JSON file
	res.sendFile(filePath, (err) => {
	  if (err) {
		console.error('Error sending file:', err);
		res.status(err.status).end();
	  } else {
		console.log('File sent successfully');
	  }
	});
  });

//Server
app.listen(PORT, "0.0.0.0", (err) => {
	if (err) {
		console.log("An error was occured : ", err);
	}

	console.log(`Server is running on : http://localhost:${PORT}`);
});
