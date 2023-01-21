const TOKEN_LENGTH = 64;

module.exports = function (sequelize, Sequelize){
	let token = sequelize.define("Token", {
		id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: Sequelize.STRING(TOKEN_LENGTH),
            unique: true,
            set(value) {
                const tokenGen = _require("@/libs/token");
                this.setDataValue("token", tokenGen.token(value || TOKEN_LENGTH));
            }
        }
	},{
		paranoid: false,
		updatedAt: true
	});

	token.associate = function (models){
		token.belongsTo(models.User);
	}

	return token;
}