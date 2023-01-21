let express = require("express");
let router = express.Router();

module.exports = (app) => {

    let db = app.seq;

    router.get("*", (req, res, next) => {
        res.sendFile("./public/index.html");
    });

    return {
        root: "/",
        router: router,
        isOff: true
    }
};