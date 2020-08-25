const { ADMINISTRATOR } = require('../helpers/constants');

module.exports = {
	name: 'user',
	description: 'Get user info by ID',
	cooldown: 3,
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			return message.channel.send('You do not have permissions to use the `user` command.');
		}

		message.guild.members.fetch()
			.then(collection => {
				collection
					.each(user => {
						if (user.user.id === args[0]) {
							return message.channel.send(`id: ${user.user.id}\nusername: ${user.user.username}\nnickname: ${user.nickname}`);
						}
					});
			});
	},
};
