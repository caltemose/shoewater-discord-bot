const ADMINISTRATOR = 'ADMINISTRATOR';
const backupKeyv = require('../modules/backupKeyv');

module.exports = {
	name: 'data',
	description: 'Data utilities for admins: `backup` is currently all that is implemented.',
	cooldown: 5,
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			return message.channel.send('You do not have permissions to use the `data` command.');
		}

		const subcommand = args[0];

		if (subcommand === 'backup') {
			try {
				await backupKeyv('../keyv.json', '../backups');
				console.log('keyv file has been backed up.');
				message.channel.send('data has been backed up');
			} catch (err) {
				console.error('! keyv WAS NOT backed up.');
				console.error('err', err);
				message.channel.send('data WAS NOT backed up. contact shoewater.');
			}
		}
	},
};
