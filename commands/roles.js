const { ADMINISTRATOR } = require('../helpers/constants');
const { logger, getISOStamp, getNameFromMessage } = require('../helpers/utils');
const ignoredRoles = [ '@everyone', 'shoewater bot' ];

const getRolesString = (roles) => {
	var response = 'Roles in this guild:\n';
	for (var role in roles) {
		response += ` + ${roles[role]}\n`;
	}
	return response;
};

module.exports = {
	name: 'roles',
	description: 'Get roles for this guild.',
	cooldown: 5,
	usage: [
		{ text: `lists the roles for this guild and stores them in memory for use elsewhere. Ignores roles: \`${ignoredRoles.join(', ')}\`` },
	],
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			logger(`'${getNameFromMessage(message)}' tried to access the 'data' command without permission.`, getISOStamp());
			return message.channel.send('You do not have permissions to use the `roles` command.');
		}

		var rolesStore = await keyv.get('roles');

		if (!rolesStore) {
			rolesStore = {};
		}
		
		if (!rolesStore[guildId]) {
			rolesStore[guildId] = {};
		}
		// always reset the data to delete roles that were deleted from Discord or
		// added to the ignore list
		else rolesStore[guildId] = {};

		message.guild.roles.fetch()
			.then(async roles => {
				roles.cache
					.each(role => {
						if (!ignoredRoles.includes(role.name)) {
							rolesStore[guildId][role.id] = role.name;
						}
					})
				const rolesWereSet = await keyv.set('roles', rolesStore);
				let response;
				if (rolesWereSet) response = getRolesString(rolesStore[guildId]);
				else {
					logger(`'${getNameFromMessage(message)}' used 'roles' and setting the keyv store failed.`, getISOStamp());
					response = 'Could not set roles in keyv';
				}
				return message.channel.send(response);
			})
			.catch(console.error)
	},
};
