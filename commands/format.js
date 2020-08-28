const { ADMINISTRATOR } = require('../helpers/constants');
const { getNameFromMessage } = require('../helpers/utils');
const { logger } = require('../modules/logger');

module.exports = {
	name: 'format',
	description: 'message format testing',
	cooldown: 1,
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			logger.warn(`'${getNameFromMessage(message)}' tried to access the 'format' command`);
			return message.channel.send('You do not have permissions to use the `format` command.');
		}

		let msg;
		const subcommand = args[0];
		if (!subcommand) {
			msg = 'a_user\nanother_user\na_third__user\nand-a__fourth';
			return message.channel.send(msg);
		}
		else {
			switch (subcommand) {
				case 'esc':
					msg = 'a\_user\nanother\_user\na\_third\_\_user\nand-a\_\_fourth';
					break;
				case 'code':
					msg = '```\na_user\nanother_user\na_third__user\nand-a__fourth\n```';
					break;
				case 'single':
					msg = 'a_single_underscore\n_single_';
					break;
				default:
					msg = 'unrecognized subcommand';
					break;
			}
			return message.channel.send(msg);
		}
	},
};
