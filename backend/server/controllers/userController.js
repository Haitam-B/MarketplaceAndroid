const { User } = require("../db/collection");

const createUser = async (userData) => {
	try {
		const user = new User(userData);
		console.log(user);
		await user.save();
		return user;
	} catch (error) {
		throw error;
	}
};

const getUsers = async () => {
	try {
		const users = await User.find();
		return users;
	} catch (error) {
		throw error;
	}
};

const getUSer = async email => {
	const user = await User.findOne( { email: email } );
	if (user) {
		return user
	}

	else {
		return null
	}
}

// Other user-related controller functions can go here

module.exports = { createUser, getUsers, getUSer };
