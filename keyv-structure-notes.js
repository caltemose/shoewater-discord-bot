var keyv = {

	guilds: {
		guildId: guildName // [String]
	},

	roles: {
		guildId: {
			roleId: {
				roleName, // [String]
				adminGroup, // [Boolean]
			},
		},
	},

	members: {
		guildId: {
			members: {
				memberName: {
					memberId,
					memberRoleId,
				},
			},
		},
	},

	psn: {
		guildId: {
			psn: {
				memberName: memberPsn,
			},
		},
	},

};
