const { ADMINISTRATOR } = require('../helpers/constants');
const NO_ROLE = 'no role';

const getRoleIds = (roles) => {
	var roleIds = {};
	for (const id in roles) {
		roleIds[id] = [];
	}
	return roleIds;
};

const getSortedMembersList = (membersByRoleId, roles) => {
	var message = '```Members sorted by role:\n\n';
	
	Object.keys(roles).forEach(key => {
		message += `**${roles[key]}**\n`;
		membersByRoleId[key].forEach(member => {
			message += member.displayName + '\n';
		});
		message += '\n';
	});

	message += '**No Role Assigned**\n';
	membersByRoleId[NO_ROLE].forEach(member => {
		message += member.displayName + '\n';
	});
	
	message += '```';
	
	return message;
};

module.exports = {
	name: 'members',
	description: 'Get members for this guild, sorted by role.',
	usage: [
		{ text: 'Lists the members of this Discord guild, sorted by roles. Requires the roles to be stored in memory ahead of time.' },
		{ subcommand: 'update', text: 'Rebuilds the members list for this guild.' },
	],
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			return message.channel.send('You do not have permissions to use the `members` command.');
		}

		var allMembers = await keyv.get('members');
		if (!allMembers) {
			allMembers = {};
		}

		const subcommand = args[0];

		if (subcommand === 'update') {
			// guild members list is always overwritten when updated
			var guildMembers = {};

			message.guild.members.fetch()
				.then(collection => {
					collection
						.filter(user => !user.user.bot)
						.each(user => {
							const userObj = {
								id: user.user.id,
								username: user.user.username,
								nickname: user.nickname,
								displayName: user.nickname || user.user.username,
								roles: user._roles,
							};
							guildMembers[user.user.id] = userObj;
						});

					allMembers[guildId] = guildMembers;
					keyv.set('members', allMembers);

					return message.channel.send('members list has been updated.');
				})
				.catch(console.error);
		}
		else if (subcommand === 'clear') {
			if (allMembers[guildId]) {
				allMembers[guildId] = {};
				await keyv.set('members', allMembers);
				return message.channel.send('members list for this guild has been cleared.');
			}
		}
		else if (!subcommand) {
			let rolesIssues;

			var allRoles = await keyv.get('roles');
			if (!allRoles) {
				rolesIssues = 'Could not find roles. Run the `roles` command to retrieve them before getting the members list.';
			}

			var guildRoles;
			if (allRoles && allRoles[guildId]) {
				guildRoles = allRoles[guildId];
			}

			if (!guildRoles) {
				rolesIssues = 'Could not find roles. Run the `roles` command to retrieve them before getting the members list.';
			}

			if (rolesIssues) {
				return message.channel.send(rejection);
			}

			const guildMembers = allMembers[guildId];
			if (!guildMembers) {
				return message.channel.send('There is no member list. Run the `members update` command first.');
			}

			var membersByRoleId = getRoleIds(guildRoles);
			membersByRoleId[NO_ROLE] = [];

			for(var memberId in guildMembers) {
				const member = guildMembers[memberId];

				if (!member.roles || !member.roles.length) {
					membersByRoleId[NO_ROLE].push(member);
				}
				else {
					member.roles.forEach(userRoleId => {
						if (membersByRoleId[userRoleId]) {
							membersByRoleId[userRoleId].push(member);
						}
					});
				}
			}

			return message.channel.send( getSortedMembersList(membersByRoleId, guildRoles) );
		}
	},
};
