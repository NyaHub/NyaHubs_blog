module.exports = async (app, logger) => {

    const Sequelize = require("sequelize");
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: (msg) => {
            logger.info(msg)
        },
        define: {
            paranoid: true,
            createdAt: false,
            updatedAt: false
        }
    });

    app.locals.sequelize = sequelize;
    app.locals.Sequelize = Sequelize;

    let path = require("path"),
        models = await _require("@/libs/autoload")("./models", "file"),
        m = [];

    for (const e of models) {
        if (path.basename(e) !== "index.js") {
            m.push(require(path.join(process.cwd(), e))(sequelize, Sequelize));
        }
    }
    for (const e of m) {
        e.associate(sequelize.models);
    }

    return {
        models: sequelize.models,
        sequelize: sequelize,
        Sequelize: Sequelize
    };
}