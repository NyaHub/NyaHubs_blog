const createError = require("http-errors");

module.exports = {
	APIwork: function (task){
		return async function (req, res, next){
			try{
				let r = await task(req, res, next);
				res.send(JSON.stringify(r));
				res.end();
			}catch(e){
				next(createError(500));
			}
		}
	},
	regWork: function (task, viewUrl, render = true){
		return async function (req, res, next){
			try{
				let r = await task(req, res, next);
				if(!r.code){
					// console.log(r)
					res.render(viewUrl, {...res.locals.data, ...r});
				}else{
					res.redirect(viewUrl);
				}
			}catch(e){
				next(createError(500));
			}
		}
	},
}