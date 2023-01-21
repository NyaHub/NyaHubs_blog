const md5 = require("md5");

module.exports = function (sequelize, Sequelize) {
    let File = sequelize.define("File", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        hash:{
            type: Sequelize.STRING,
            unique:true,
            set(value){
                this.setDataValue("hash", md5(value, this.name));
            }
        },
        name:Sequelize.STRING,
        type:Sequelize.STRING
    }, {
        createdAt: true
    });

    File.associate = function (models) {
        File.belongsTo(models.User);
    }
    return File;
}