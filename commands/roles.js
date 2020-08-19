const getRolesString = (roles) => {
	var response = 'Roles in this guild:\n';
	for (var role in roles) {
		response += ` + ${roles[role]}\n`;
	}
	return response;
};

module.exports = {
	//const name = 'roles';
	//const description = 'Get roles for this guild.';
	name: 'roles',
	description: 'Get roles for this guild.',
	cooldown: 5,
	execute: async (message, args, keyv, prefix, guildId) => {
		var rolesStore = await keyv.get('roles');
		
		if (!rolesStore) {
			rolesStore = {};
		}
		
		if (!rolesStore[guildId]) {
			rolesStore[guildId] = {};
		}

		message.guild.roles.fetch()
			.then(async roles => {
				roles.cache
					.each(role => {
						if (role.name !== '@everyone') {
							rolesStore[guildId][role.id] = role.name;
						}
					})
				const rolesWereSet = await keyv.set('roles', rolesStore);
				let response;
				if (rolesWereSet) response = getRolesString(rolesStore[guildId]);
				else response = 'Could not set roles in keyv';
				message.channel.send(response);
			})
			.catch(console.error)
	},
};
