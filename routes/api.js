let express = require("express");
const multer = require("multer");
let router = express.Router();
let logger = _require("@/libs/logger")("routes/api.js");
let {APIwork: worker} = _require('@/libs/net');
const cors = require("cors");
const createError = require("http-errors");

module.exports = (app) => {

    let db = app.seq;

    router.use(cors());
    router.use((req, res, next) => {
        res.setHeader("Content-type", "application/json");
        next();
    });

    //-------------------------------------------------------file API--------------------------------------------------------

    let FileC = _require("@/controllers/FileController");
    let File = new FileC(app, db);

    let upload = multer({dest: "./tmp/"});

    router.get("/file/list", worker(File.getFiles));
    router.post("/file/delete/:hash", worker(File.deleteFile));
    router.post("/file/upload", upload.any(), worker(File.uploadFile))

    //-----------------------------------------------------end file API------------------------------------------------------

    //-----------------------------------------------------user API------------------------------------------------------

    let UserC = _require("@/controllers/UserController");
    let User = new UserC(app, db);

    router.route("/user/login/").post(worker(User.loginPost));
    router.route("/user/register/").post(worker(User.registerPost));
    router.route("/user/delete/").post(worker(User.DeletePost));
    router.get("/user/logout/", worker(User.logout));
    router.post("/user/logout/", worker(User.logout));
    router.post("/user/profile/", worker(User.Profile));
    router.post("/user/profile/:name", worker(User.Profile));

    //-----------------------------------------------------user API------------------------------------------------------

    return {
        root: "/api/",
        router: router
    }
};