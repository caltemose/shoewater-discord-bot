const { ADMINISTRATOR } = require('../helpers/constants');
const logger = require('../modules/logger');
const { getNameFromMessage, splitMessageForLimit } = require('../helpers/utils');
const NO_ROLE = 'no role';

const getRoleIds = (roles) => {
	var roleIds = {};
	for (const id in roles) {
		roleIds[id] = [];
	}
	return roleIds;
};

const getSortedMembersList = (membersByRoleId, roles) => {
	var message = '';
	// TODO need a guild-specific and not shite hard-coded solution
	const ignoredRoles = ['729481197872349235', '729629552850239549', '729640707282960395', '729640886559834153', '729739903428198411'];

	Object.keys(roles).forEach(key => {
		if (!ignoredRoles.includes(key)) {
			message += `**${roles[key].toUpperCase()}:**\n`;
			membersByRoleId[key].forEach(member => {
				message += member.displayName + '\n';
			});
			message += '\n';
		}
	});

	if (membersByRoleId[NO_ROLE].length) {
		message += '**NO ROLE ASSIGNED:**\n';
		membersByRoleId[NO_ROLE].forEach(member => {
			message += member.displayName + '\n';
		});
	}
	
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
			logger.warn(`'${getNameFromMessage(message)}' tried to access the 'members' command`);
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
					logger.info(`'${getNameFromMessage(message)}' ran the 'members' command and updated the member list.`);
					return message.channel.send('members list has been updated.');
				})
				.catch(logger.error);
		}
		else if (subcommand === 'clear') {
			if (allMembers[guildId]) {
				allMembers[guildId] = {};
				await keyv.set('members', allMembers);
				logger.info(`'${getNameFromMessage(message)}' cleared the member list.`);
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
				logger.warn(`'${getNameFromMessage(message)}' ran the 'members' command and received a rejection message.`, rejection);
				return message.channel.send(rejection);
			}

			const guildMembers = allMembers[guildId];
			if (!guildMembers) {
				logger.warn(`'${getNameFromMessage(message)}' ran the 'members' command without a members list.`);
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
			const fullMessage = getSortedMembersList(membersByRoleId, guildRoles);
			
			const msgArray = splitMessageForLimit(fullMessage);
			msgArray.forEach(msg => {
				message.channel.send('```' + msg + '```');
			});

			return;
		}
	},
};
