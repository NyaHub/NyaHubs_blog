const {Op} = require("sequelize");
const bcrypt = require("bcrypt");
const createError = require("http-errors");
let logger = _require("@/libs/logger")("UserController.js");

module.exports =
    class User {
        constructor(app, db) {
            this.app = app;
            this.db = db;

            this.loginPost = this.loginPost.bind(this)
            this.registerPost = this.registerPost.bind(this)
            this.logout = this.logout.bind(this)
            this.DeletePost = this.DeletePost.bind(this)
            this.Profile = this.Profile.bind(this)
        }

        // [GET] /user/login
        loginGet(req, res, next) {
            res.render("login", res.locals.data);
        }

        // [POST] /user/login
        async loginPost(req, res, next) {
            let token = null;
            if (!res.locals.data.User.authorized) {
                try {
                    if (!(req.body.login && req.body.email)) {
                        let login = req.body.login || " ";
                        let email = req.body.email || " ";
                        let user = await this.db.models.User.findOne({
                            where: {
                                [Op.or]: [
                                    {name: login},
                                    {email: email}
                                ]
                            }
                        });
                        if (user && await bcrypt.compare(user.name + user.email + req.body.password, user.password)) {
                            token = await this.Authenticate(res, user);
                        } else {
                            return {code: "USER_NOT_FOUND", message: "User not found!"};
                        }
                    } else {
                        logger.warn("No, you need pass login or email!")

                        return {code: "PASSED_ALL", message: "Passed login and email!"};
                    }
                } catch (e) {
                    logger.warn("Login" + JSON.stringify(e));

                    return {code: 500, message: "Internal server error!"};
                }
            }else return {code: "AUTHORIZED", message: "Authorized!"};
            
            return {code: 0, token: token};
        }

        // [GET] /user/register
        registerGet(req, res, next) {
            res.render("register", res.locals.data);
        }

        // [POST] /user/register
        async registerPost(req, res, next) {
            let token = null;
            if (!res.locals.data.User.authorized) {


                let t = await this.db.sequelize.transaction();
                try {
                    console.log(req.body)
                    let user = this.db.models.User.build({
                        name: req.body.login,
                        email: req.body.email,
                        password: req.body.password
                    }, {transaction: t});

                    await user.validate();

                    await user.save({transaction: t});

                    token = await this.Authenticate(res, user, t);

                    if (token) await t.commit();
                    else {
                        await t.rollback();

                        return {code: "LOGIN_ERROR", message: "Authentication error!"};
                    }
                } catch (e) {
                    logger.warn("Register " + e.message);
                    console.log(e)
                    await t.rollback();

                    return {code: e?.name == 'SequelizeUniqueConstraintError' ? "EMAIL_OR_LOGIN_WAS_USED" : 500, message: e?.name == 'SequelizeUniqueConstraintError' ? "Email or name was used" : "Internal server error"};
                }
            }else return {code: "AUTHORIZED", message: "Authorized!"};
            
            return {code: 0, token: token};
        }


        async Authenticate(res, user, t) {
            let f = false;
            if (!t) {
                t = await this.db.sequelize.transaction();
                f = true;
            }
            try {
                let token = await this.db.models.Token.create({token: null}, {transaction: t});
                await user.addToken(token, {transaction: t});

                res.cookie("user", token.token);

                if (f) await t.commit();
                return token.token;
            } catch (e) {
                logger.warn("Authenticate" + JSON.stringify(e));
                console.log(e)
                if (f) await t.rollback();
                return 0;
            }
        }

        // [GET] /user/logout
        async logout(req, res, next, t) {
            if (res.locals.data.User.authorized) {
                if(!t) t = await this.db.sequelize.transaction();
                try {
                    await this.db.models.Token.destroy({
                        where: {
                            token: req.cookies.user
                        }
                    }, {transaction: t});

                    await t.commit();
                } catch (e) {
                    logger.warn("Logout" + JSON.stringify(e.message));
                    await t.rollback();
                    return {code:500, message:"Internal server error!"}
                }

                res.clearCookie("user");
            }

            return {code: 0, message: "Logout."}
        }

        // [GET] /user/delete
        Delete(req, res, next) {
            res.render("delete", res.locals.data);
        }

        // [POST] /user/delete
        async DeletePost(req, res, next) {
            if (res.locals.data.User.authorized) {
                // console.log(res.locals.user)
                if (phash.verify(res.locals.user.name + res.locals.user.email + req.body.password, res.locals.user.password)) {
                    let t = await this.db.sequelize.transaction();

                    try {

                        await res.locals.user.destroy({transaction: t});

                        await t.commit();
                    } catch (e) {
                        logger.warn("Delete" + JSON.stringify(e));
                        await t.rollback();
                        return {code:500, message:"Internal server error!"}
                    }
                }
            }
            return {code:0, message:"Delete."}
        }

        // [GET] /user/profile/{name}
        async Profile(req, res, next) {
            if (!(req?.params?.name || res.locals.data.User.authorized)) {
                return {code: 403, message:"Unauthorized"};
            }

            let f = req?.params?.name == res.locals.data.User?.data?.name;

            if (!f && req.params.name) {
                try {
                    let user = await this.db.models.User.findOne({
                        where: {name: req.params.name},
                        attributes: ["name", "email", "registrationDate", "lastIn"]
                    });
                    res.locals.data.user = user.dataValues;
                } catch (e) {
                    return {code: 404, message: "Not found!"};
                }
            } else {
                res.locals.data.user = res.locals.data.User.data;
            }
            return {code: 0, user: res.locals.data.user , isYoursProfile: f};
        }
    }

