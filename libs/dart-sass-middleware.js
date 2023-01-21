// Grabbed from https://github.com/Inkbug/dart-sass-middleware

const path = require('path');
const fs = require("fs");
const sass = require("sass");

module.exports = (pathToSCSS, config) => {
    return ( req, res, next ) => {
        // ignore all requests that are not GET or don't have .css in them
        if (
            req.method.toLowerCase() !== "get" ||
            !req.path.match(/\/[a-zA-Z_0-9\-\.]+\.css$/)
        ) {
            return next();
        }
        // convert url into matching path
        let filename = path.join(process.cwd(), pathToSCSS, req.path);
        fs.access(filename, err => {
            if ( !err ) { // css file exists - continue on
                return next();
            }
            filename = filename.replace(/\.css$/, ".scss");
            fs.access(filename, err => {
                if ( err ) { // scss file doesn't exist;
                    return next();
                }
                sass.render({
                    file: filename
                }, ( err, result ) => {
                    res.set('Content-Type', 'text/css');
                    if ( err ) {
                        req.error = err;
                        return res.status(500).send(err.formatted);
                    } else {
                        return res.send(result.css);
                    }
                });
            });
        });
    };
};