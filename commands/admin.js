const { ADMINISTRATOR } = require('../modules/constants');
const { getNameFromMessage } = require('../modules/utils');
const logger = require('../modules/logger');
const writeFileJson = require('../modules/write-file-json');

module.exports = {
	name: 'admin',
	description: 'Various administrator functions',
	cooldown: 5,
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			logger.warn(`'${getNameFromMessage(message)}' tried to access the 'clear' command`);
			return message.channel.send('You do not have permissions to use the `clear` command.');
		}

		const subcommand = args[0];

		if (subcommand === 'member-report') {
			// try {
			// 	const results = await writeFileJson({'something':'else'}, '../asdf/test.json');
			// 	return true;
			// }
			// catch (error) {
			// 	console.error(error);
			// }

			const filePath = '../backups/test.json';

			await writeFileJson({'something':'else'}, filePath)
				.catch(err => {
					console.log(err);
					return message.channel.send('There was an error saving the clan file.');
				});

			return message.channel.send(`The file was written to:\n${filePath}`);

			/*
			1. get clan list from API
			2. update discord member list
			3. get discord member list
			4. make comparisons
				a. sort discord members into: 
					1. not in clan
						a. with 'not in clan' role
						b. without 'not in clan' role
					2. in clan
						a. with 'not in clan' role
						b. without 'not in clan' role
				b. get clan members not in discord
			5. report above
			*/
		}
	}
};
