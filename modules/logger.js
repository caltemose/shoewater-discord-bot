const { createLogger, format, transports } = require('winston');
const path = require('path');
const { VERSION } = require('./constants');

// eslint-disable-next-line no-undef
const errorFile = path.join(__dirname, '../logs/errors.log');
// eslint-disable-next-line no-undef
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
	defaultMeta: { service: `shoebot-logger ${VERSION}` },
	transports: [
		new transports.File({ filename: errorFile, level: 'error' }),
		new transports.File({ filename: infoFile, level: 'info' }),
	],
});

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV !== 'production') {
	logger.add(new transports.Console({
		format: format.combine(
			format.colorize(), 
			format.simple(),
			format.prettyPrint()
		),
	}));
}

module.exports = logger;
