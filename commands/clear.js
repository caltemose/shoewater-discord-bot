const { ADMINISTRATOR } = require('../helpers/constants');

module.exports = {
	name: 'clear',
	description: 'Clear the current channel of x messages where x is between 2 and 100. Example: `clear 25`',
	cooldown: 5,
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			return message.channel.send('You do not have permissions to use the `clear` command.');
		}

		const deleteCount = parseInt(args[0], 10);

		if (!deleteCount || deleteCount < 2 || deleteCount > 100) {
			return message.channel.send("Please provide a number between 2 and 100 for the number of messages to delete");
		}

		const fetched = await message.channel.messages.fetch({limit: deleteCount});
		message.channel
			.bulkDelete(fetched)
			.catch(error => message.reply(`Couldn't delete messages: ${error}`));
		
	},
};