const { ADMINISTRATOR } = require('../helpers/constants');
const backupKeyv = require('../modules/backupKeyv');

module.exports = {
	name: 'data',
	description: 'Data utilities for admins: `backup` is currently all that is implemented.',
	cooldown: 10,
	usage: [
		{ subcommand: 'backup', text: 'creates a backup of all stored data on the bot computer.' },
	],
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			return message.channel.send('You do not have permissions to use the `data` command.');
		}

		const subcommand = args[0];
		if (!subcommand) {
			return message.channel.send('The `data` command cannot be used without a subcommand like so: `data backup`');
		}

		if (subcommand === 'backup') {
			try {
				await backupKeyv('../keyv.json', '../backups');
				console.log('keyv file has been backed up.');
				return message.channel.send('data has been backed up');
			} catch (err) {
				console.error('! keyv WAS NOT backed up.');
				console.error('err', err);
				return message.channel.send('data WAS NOT backed up. contact shoewater.');
			}
		}
	},
};
