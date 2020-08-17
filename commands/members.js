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
	execute: async (message, args, keyv) => {
		var roles = await keyv.get('roles');
		
		if (!roles) {
			message.channel.send('Could not find roles. Run the `roles` command to retrieve them before getting the members list.');
		}

		message.guild.members.fetch()
			.then(collection => {
				var membersByRoleId = getRoleIds(roles);
				var members = [];
				collection
					.filter(user => !user.user.bot)
					.each(user => {
						console.log(user);
						members.push({
							id: user.user.id,
							username: user.user.username,
							roles: user._roles,
						});
						user._roles.forEach(userRoleId => {
							if (userRoleId && membersByRoleId[userRoleId]) {
								membersByRoleId[userRoleId].push({
									id: user.user.id,
									username: user.user.username,
								});
							}
						});
					});
				// console.log('membersByRoleId', membersByRoleId);
				const membersList = getSortedMembersList(membersByRoleId, roles);
				// console.log(membersList);
				/*
				determine best way to store members in JSON for associating PSNs
				- this could happen in a different message
				- need membersById object to speed up actions
				- 
				*/
				// keyv.set('members', members);
				message.channel.send(membersList);
			})
			.catch(console.error);
	},
};

/*

roles = {
	roleId: roleName
}

*/
