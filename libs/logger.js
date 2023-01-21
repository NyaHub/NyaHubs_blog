const winston = require("winston");

module.exports = (module) => {
    return winston.createLogger({
        'transports': [
            new winston.transports.Console()
        ],
        format: winston.format.combine(
            winston.format.label({
                label: `[${module}]`
            }),
            winston.format.timestamp({
                format: 'HH:mm:ss'
            }),
            winston.format.printf(info => `${info.label}: ${[info.timestamp]}: ${info.message}`),
        )
    });
}