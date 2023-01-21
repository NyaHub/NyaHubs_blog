let path = require("path");
let fs = require("fs");

async function autoload(root, ent) {
    glob_root = root.replace("@", path.dirname(require.main.filename))
    root = root.replace("@", "./")

    let flag = 0;
    let error = "";
    let files = fs.readdirSync(glob_root);

    // console.log("[autoload]:", files);

    let ff = [];
    for (const f of files) {
        if (ent == "file" && fs.lstatSync(path.join(glob_root, f)).isFile() && f.match(/.+\.js$/gmi) != null) {
            ff.push(path.join(root, f));
        }
        if (ent == "dir" && fs.lstatSync(path.join(glob_root, f)).isDirectory() && ![".", ".."].includes(f)){
            ff.push(path.join(root, f));
        }
    }
    return ff;

}

module.exports = autoload;