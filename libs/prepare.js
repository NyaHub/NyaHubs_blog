module.exports = ()=>{
	return async function (req, res, next){
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
	            // {text: "Login", url: "/user/login"},
	            // {text: "Logout", url: "/user/logout"},
	            // {text: "Register", url: "/user/register"},
	            // {text: "Delete", url: "/user/delete"},
	            // {text: "Profile", url: "/user/profile"},
	            {text: "Home", url: "/"}
	        ]
		};

		next();
	}
}