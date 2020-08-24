const { ADMINISTRATOR } = require('../helpers/constants');

const getRoleIds = (roles) => {
	var roleIds = {};
	for (const id in roles) {
		roleIds[id] = [];
	}
	return roleIds;
};

const getSortedMembersList = (membersByRoleId, roles) => {
	var message = 'Members sorted by role:\n\n';
	Object.keys(roles).forEach(key => {
		message += `**${roles[key]}**\n`;
		membersByRoleId[key].forEach(member => {
			message += member.username + '\n';
		});
		message += '\n';
	});
	return message;
};

module.exports = {
	name: 'members',
	description: 'Get members for this guild, sorted by role.',
	cooldown: 5,
	usage: [
		{ text: 'Lists the members of this Discord guild, sorted by roles. Requires the roles to be stored in memory ahead of time.' },
	],
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			return message.channel.send('You do not have permissions to use the `members` command.');
		}

		var allRoles = await keyv.get('roles');
		if (!allRoles) {
			allRoles = {};
		}

		var roles;
		if (allRoles[guildId]) {
			roles = allRoles[guildId];
		}
		
		if (!roles) {
			return message.channel.send('Could not find roles. Run the `roles` command to retrieve them before getting the members list.');
		}

		var allMembers = await keyv.get('members');
		if (!allMembers) {
			allMembers = {};
		}

		// no need to worry about what's in store since the only data stored there
		// comes from Discord and can be safely overwritten. for now.
		var guildMembers = {};

		message.guild.members.fetch()
			.then(collection => {
				var membersByRoleId = getRoleIds(roles);
				var membersNoRole = [];

				collection
					.filter(user => !user.user.bot)
					.each(user => {
						const userObj = {
							id: user.user.id,
							username: user.user.username,
							roles: user._roles,
						};
						guildMembers[user.user.id] = userObj;
						if (!user._roles || user._roles.length === 0) {
							membersNoRole.push(userObj);
						}
						user._roles.forEach(userRoleId => {
							if (userRoleId && membersByRoleId[userRoleId]) {
								membersByRoleId[userRoleId].push(userObj);
							}
						});
					});
				
				let msg = getSortedMembersList(membersByRoleId, roles);
				msg += `**Members without roles:**\n`;

				membersNoRole.forEach(member => {
					msg += member.username + '\n';
				});

				allMembers[guildId] = guildMembers;
				keyv.set('members', allMembers);

				return message.channel.send(msg);
			})
			.catch(console.error);
	},
};
