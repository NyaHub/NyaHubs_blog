let express = require("express");
const createError = require("http-errors");
const multer = require("multer");
const logger = _require("@/libs/logger")("routes/file.js");
let router = express.Router();

module.exports = (app) => {

    let db = app.seq;

    let FileC = _require("@/controllers/FileController");
    let File = new FileC(app, db);

    let upload = multer({dest: "./tmp/"});

    router.route("/download/:hash")
        .get(async (req, res, next) => {
            let r = await File.downloadFile(req, res, next); // {code: <code>, file: <fileStream>, type: <contentType>, fileName: <fileName>}
            if (r.code != 0) next(createError(r.code));
            else {
                res.setHeader("Content-type", r.type);
                res.setHeader("Content-Disposition", `attachment; filename=${encodeURI(r.fileName)}`);
                res.send(r.file);
                res.end();
            }
        });

    // router.route("/edit/:hash")
    //     .get(async (req, res, next) => {
    //         if (req.query.action == "edit") {
    //             let r = await File.editImage(req, res, next); // {code: <code>, file: <fileStream>, type: <contentType>, fileName: <fileName>}
    //             if (r.code != 0) next(createError(r.code));
    //             else {
    //                 res.setHeader("Content-type", r.type);
    //                 res.setHeader("Content-Disposition", `attachment; filename=${encodeURI(r.fileName)}`);
    //                 res.send(r.file);
    //                 res.end();
    //             }
    //         } else {
    //             try {
    //                 let file = await db.models.File.findOne({
    //                     where: {hash: req.params.hash}
    //                 });
    //                 res.render("edit", {...res.locals.data, file: file});
    //             } catch (e) {
    //                 logger.warn("Error in sequelize");
    //                 console.log(e);
    //                 next(createError(500));
    //             }
    //         }
    //     });

    return {
        root: "/file",
        router: router
    }
};