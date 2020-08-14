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
	execute: (message, args) => {
		var rolesClean = {}; //await keyv.get('roles');
		// if (!rolesClean) rolesClean = {};

		message.guild.roles.fetch()
			.then(roles => {
				roles.cache
					.each(role => {
						if (role.name !== '@everyone') {
							rolesClean[role.id] = role.name;
						}
					})
				// await keyv.set('roles', rolesClean);
				const response = getRolesString(rolesClean);
				message.channel.send(response);
			})
			.catch(console.error)
	},
};
