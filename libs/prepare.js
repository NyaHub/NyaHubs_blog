module.exports = () => {
	return async function (req, res, next) {
		let logger = _require("@/libs/logger")("prepare.js");

		logger.info("prepare");

		res.locals.data = {
			User: {
				authorized: false,
				avatar: "/images/avatars/default.png"
			},
			path: require("path"),

			title: "Kawaii Tests",
			nav: [
				{ text: "Login", url: "/user/login", l:"UNLOGED" },
				{ text: "Logout", url: "/user/logout", l:"LOGED" },
				{ text: "Register", url: "/user/register", l:"UNLOGED" },
				{ text: "Delete", url: "/user/delete", l:"LOGED" },
				{ text: "Profile", url: "/user/profile", l:"LOGED" },
				{ text: "Home", url: "/", l: "ALL" }
			]
		};

		next();
	}
}