module.exports = ()=>{
	return async function (req, res, next){
		let logger = _require("@/libs/logger")("auth");

		let token = req.cookies.user || req.cookies.sessionToken || req.body.sessionToken || req.body.token || req.query.token || req.get("Auth");

		if( !token ) return next();

		logger.info(`Token: ${token}`);

		let r = await req.app.seq.models.Token.findOne({ where: { token: token }});

		if ( !r ) {
			res.clearCookie("sessionToken");
			return next();
		}

		// TODO !!!! сделать проверку на свежесть токена !!!!

		r = await req.app.seq.models.User.findOne({ where: { id: r.UserId }});

		res.locals.data.User = {
			authorized: true,
			data: {
				name: r.name,
				email: r.email,
				registrationDate: r.registrationDate,
				lastIn: r.lastIn
			}
		}
		res.locals.user = r;

		next();
	}
}