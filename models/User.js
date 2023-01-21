module.exports = function (sequelize, Sequelize) {
    const bcrypt = require('bcrypt');

    let User = sequelize.define("User", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            unique: true
        },
        email: {
            type: Sequelize.STRING,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING,
            async set(value) {
                this.setDataValue('password', await bcrypt.hash(this.name + this.email + value, 10));
            }
        },
        registrationDate: {
            type: Sequelize.DATEONLY,
            defaultValue: Sequelize.NOW
        },
        lastIn: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });

    User.associate = function (models) {
        User.hasMany(models.Token, {onDelete: "CASCADE"});
        User.hasMany(models.File);
    }

    return User;
}