const { ADMINISTRATOR } = require('../helpers/constants');
const backupKeyv = require('../modules/backupKeyv');
const logger = require('../modules/logger');
const { getNameFromMessage } = require('../helpers/utils');

module.exports = {
	name: 'data',
	description: 'Data utilities for admins: `backup` is currently all that is implemented.',
	cooldown: 10,
	usage: [
		{ subcommand: 'backup', text: 'creates a backup of all stored data on the bot computer.' },
	],
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			logger.warn(`'${getNameFromMessage(message)}' tried to access the 'data' command without permission.`);
			return message.channel.send('You do not have permissions to use the `data` command.');
		}

		const subcommand = args[0];
		if (!subcommand) {
			logger.warn(`'${getNameFromMessage(message)}' used 'data' without a subcommand`);
			return message.channel.send('The `data` command cannot be used without a subcommand like so: `data backup`');
		}

		if (subcommand === 'backup') {
			try {
				await backupKeyv('../keyv.json', '../backups');
				logger.log('keyv file has been backed up.');
				return message.channel.send('Data has been backed up.');
			} catch (err) {
				logger.warn('! keyv WAS NOT backed up.', err);
				return message.channel.send('Data WAS NOT backed up. contact @shoewater.');
			}
		}
	},
};
