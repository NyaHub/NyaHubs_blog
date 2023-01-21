let logger = _require("@/libs/logger")("FileController.js");
let fs = require("fs");
const sharp = require("sharp");
const path = require("path");

module.exports = function (app, db){

    async function deleteTempFiles(files) {
        for (const f of files) {
            try {
                await fs.unlinkSync(f.path);
                logger.info(`deleted - ${f.originalname}`);
            } catch (e) {
                logger.warn(`error while deleting - ${f.originalname}`);
            }
        }
    }

    // [POST] /file/upload
    this.uploadFile = async function (req, res, next) {
        if (!res.locals.data.User.authorized) {
            await deleteTempFiles(req.files);
            return {code: 403};
        }
        let fileIds = [];

        let t = await db.sequelize.transaction();

        try {
            for (const f of req.files) {
                let q = await db.models.File.create({
                    name: Buffer.from(f.originalname, 'latin1').toString('utf8'),
                    hash: new Date().getTime(),
                    type: f.mimetype,
                    UserId: res.locals.user.id
                }, {transaction: t});

                await fs.renameSync(f.path, `./user_files/${q.hash}`);

                fileIds.push({hash:q.hash, name:q.name});
            }
            await t.commit();
        } catch (e) {
            logger.warn('error while working...');
            await t.rollback();
            return {code: 500, message: 'Error while working...'};
        }

        return {code: 0, files: fileIds};
    }
    this.deleteFile = async function (req, res, next) {
        if (!res.locals.data.User.authorized) {
            return {code: 403};
        }
        let t = await db.sequelize.transaction();
        try {
            let f = await db.models.File.destroy({
                where:{
                    hash: req.params.hash,
                    UserId: res.locals.user.id
                }
            });

            await t.commit();
            return {code: 0};

        }catch (e) {
            logger.warn('error while working...');
            await t.rollback();
            return {code: 500, message: 'Error while working...'};
        }
    }
    this.downloadFile = async function (req, res, next) {
        try {
            let f = await db.models.File.findOne({
                where: {
                    hash: req.params.hash
                }
            });

            if (f) {
                let file = fs.readFileSync(`./user_files/${f.hash}`);

                return {code: 0, file: file, type: f.type, fileName: f.name};
            } else {
                return {code: 404, message: 'Not'};
            }
        } catch (e) {
            logger.warn('Error finding file...');
            console.log(e);
            return {code: 500, message: 'Error finding file...'};
        }

    }
    this.editImage = async function (req, res, next) {
        try {
            let f = await db.models.File.findOne({
                where: {
                    hash: req.params.hash
                }
            });
            if (f && f.type.match(/image\/(jpeg|png)/)) {

                let type = "";

                if (req.query.type == "png") type = "image/png";
                else type = req.query.type ? "image/jpeg" : f.type;

                let file = await dynamicResize(`./user_files/${f.hash}`, req.query.width, req.query.height, type);

                let name = f.name.replace(/\.(jpg|jpeg|png)/, "") + (type == "image/png" ? ".png" : ".jpg");

                return {code: 0, file: file, type: type, fileName: name};

            } else {
                return {code: 500};
            }
        } catch (e) {
            logger.warn('Error resizing file...');
            console.log(e);
            return {code: 500};
        }
    }

    function dynamicResize(file, width, height, type) {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(file)) {

                let conf = {
                    width: width ? parseInt(width)%8192 : undefined,
                    height: height ? parseInt(height)%8192 : undefined,
                    fit: (width && height) ? "fill" : "cover",
                }
                let s = sharp(file);

                if (type == "image/png") s = s.png();
                else s = s.jpeg();

                if (width || height) {
                    s = s.resize(conf);
                }

                s.toBuffer()
                    .then(r => resolve(r))
                    .catch(e => {
                        logger.warn("Error while resizing...");
                        console.log(e);
                        reject({code: 500});
                    });
            } else reject({code: 404});
        });
    }

    this.getFiles = async (req, res, next) => {
        try {
            let r = await db.models.File.findAll()
            return {code: 0, data: r}
        } catch (e) {
            logger.warn("Error!")
            return {code: 500, message: "Internal Server Error!"}
        }
    }

    return this;
}