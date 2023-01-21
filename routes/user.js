let express = require("express");
const createError = require("http-errors");
let router = express.Router();

module.exports = (app) => {

    let db = app.seq;

    let UserC = _require("@/controllers/UserController");
    let User = new UserC(app, db);

    router.route("/login/")
        .get(User.loginGet)
        .post(async (req, res, next) => {
            let result = await User.loginPost(req, res, next);
            if (result.code) {
                if (result.code == 500) {
                    next(createError(500));
                } else {
                    res.redirect(`/user/login?error=${result.code}&message=${result.message}`);
                }
            } else {
                res.redirect("/user/profile");
            }
        });
    router.route("/register/")
        .get(User.registerGet)
        .post(async (req, res, next) => {
            let result = await User.registerPost(req, res, next);
            if (result.code) {
                if (result.code == 500) {
                    next(createError(500));
                } else {
                    res.redirect(`/user/register?error=${result.code}&message=${result.message}`);
                }
            } else {
                res.redirect("/user/profile");
            }
        });
    router.route("/delete/")
        .get(User.Delete)
        .post(async (req, res, next) => {
            let result = await User.DeletePost(req, res, next);
            if (result.code) {
                if (result.code == 500) {
                    next(createError(500));
                } else {
                    res.redirect(`/user/delete?error=${result.code}&message=${result.message}`);
                }
            } else {
                res.redirect("/user/register");
            }
        });
    router.get("/logout/", async (req, res, next) => {
        let r = await User.logout(req, res, next);
        if (r.code) next(createError(500));
        else res.redirect("/user/login");
    });
    router.get("/profile/", async (req, res, next) => {
        let r = await User.Profile(req, res, next)
        console.log({...res.locals.data, ...r.data})
        if (r.code) next(createError(r.code))
        else res.render("profile", {...res.locals.data, ...r.data})
    });
    router.get("/profile/:name", async (req, res, next) => {
        let r = await User.Profile(req, res, next);
        if (r.code) next(createError(r.code));
        else if (r.isYoursProfile) res.redirect("/user/profile");
        else res.render("profile", {...res.locals.data, ...r.data});
    });

    return {
        root: "/user/",
        router: router,
        isOff: !true
    }
};