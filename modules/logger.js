const { createLogger, format, transports } = require('winston');
const path = require('path');

const errorFile = path.join(__dirname, '../logs/errors.log');
const infoFile = path.join(__dirname, '../logs/info.log');

const logger = createLogger({
	level: 'info',
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		format.errors({ stack: true }),
		format.splat(),
		format.json(),
	),
	defaultMeta: { service: 'shoebot-logger' },
	transports: [
		new transports.File({ filename: errorFile, level: 'error' }),
		new transports.File({ filename: infoFile, level: 'info' }),
	],
});

if (process.env.NODE_ENV !== 'production') {
	logger.add(new transports.Console({
		format: format.combine(format.colorize(), format.simple())
	}));
}

module.exports = logger;
