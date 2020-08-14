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
	execute: async (message, args, keyv) => {
		var rolesClean = await keyv.get('roles');
		console.log('rolesClean from keyv', rolesClean);
		if (!rolesClean) rolesClean = {};

		message.guild.roles.fetch()
			.then(async roles => {
				roles.cache
					.each(role => {
						if (role.name !== '@everyone') {
							rolesClean[role.id] = role.name;
						}
					})
				const rolesSet = await keyv.set('roles', rolesClean);
				let response;
				if (rolesSet) response = getRolesString(rolesClean);
				else response = 'Could not set roles in keyv';
				message.channel.send(response);
			})
			.catch(console.error)
	},
};
