// const { getUsers } = require('../importer.js');
const { ADMINISTRATOR } = require('../helpers/constants');

const getGuildMemberByUsername = (members, username) => {
	for (var i in members) {
		if (members[i].username === username) {
			return members[i];
		}
	}
	return null;
};

module.exports = {
	name: 'psn',
	description: 'Manage PSNs of Discord users',
	cooldown: 3,
	usage: `
[psn] will show you all the members who have PSNs that are different from their Discord
[psn all] will show you all members, including ones whose psn is the same as their Discord
[psn unset] will show you the members who have not set their PSN yet
[psn set DiscordName PSN] allows you to add a PSN to a Discord user. Note that the DiscordName is case-sensitive
example:  !psn add shoewater shoewatersDifferentPSN
[psn setsame DiscordName] sets the user's PSN to the same as their Discord
[psn clear] will wipe the entire mapping of Discord->PSN for this guild. **Be careful**
	`,
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			return message.channel.send('You do not have permissions to use the `psn` command.');
		}

		const allMembers = await keyv.get('members');
		var guildMembers;
		if (allMembers) {
			guildMembers = allMembers[guildId];
		}

		if (!allMembers || !guildMembers || !Object.keys(guildMembers).length) {
			return message.channel.send('No member list found. Run the `members` command first.');
		}

		var allPsn = await keyv.get('psn');
		var guildPsn;

		if (!allPsn) {
			allPsn = {};
			guildPsn = {};
		}
		else {
			guildPsn = allPsn[guildId];
			if (!guildPsn) {
				guildPsn = {};
			}
		}
		
		const subcommand = args[0];

		const setMemberPsn = async (same) => {
			const foundUser = getGuildMemberByUsername(guildMembers, args[1]);
			if (!foundUser) {
				return message.channel.send(`No member with name ${args[1]} was found.`);
			}
			else {
				if (same) guildPsn[foundUser.id] = { same: true };
				else guildPsn[foundUser.id] = { psn: args[2] };

				allPsn[guildId] = guildPsn;
				await keyv.set('psn', allPsn);
				const setTo = same ? 'the same as their discord' : args[2];
				return message.channel.send(`Set PSN of member ${args[1]} to ${setTo}.`);
			}
		}

		if (!Object.keys(guildPsn).length) {
			// if the guildPsn has no data yet these are the only allowed commands
			const allowed = [ 'set', 'setsame' ];
			if (!subcommand || !allowed.includes(subcommand.toLowerCase())) {
				return message.channel.send('No PSN list found. Try using the `psn set` command');
			}
			else {
				let same;
				if (subcommand.toLowerCase() === 'set') {
					if (!args[1] || !args[2]) {
						return message.channel.send('You must supply a valid Discord Name and PSN.');
					}
				}
				else {
					if (!args[1]) {
						return message.channel.send('You must supply a valid Discord Name.');
					}
					same = true;
				}
				return await setMemberPsn(same);
			}
		}
		else {
			if (!subcommand) {
				let msg = '**Members with set PSNs**\n';
				msg += '`Discord` => `PSN`\n';
				for(const memberId in guildPsn) {
					const setTo = guildPsn[memberId].same ? 'same as Discord' : guildPsn[memberId].psn;
					msg += `\`${guildMembers[memberId].username}\` => \`${setTo}\`\n`;
				}
				return message.channel.send(msg);
			} 
			else {
				if (subcommand.toLowerCase() === 'set') {
					if (!args[1] || !args[2]) {
						return message.channel.send('You must supply a valid Discord Name and PSN.');
					}
					return await setMemberPsn();
				}
				else if (subcommand.toLowerCase() === 'setsame') {
					if (!args[1]) {
						return message.channel.send('You must supply a valid Discord Name.');
					}
					return await setMemberPsn(true);
				}
				else if (subcommand.toLowerCase() === 'all') {
					let msg = '**All Members and their PSNs**\n';
					msg += '`Discord` => `PSN`\n';

					for(const memberId in guildMembers) {
						let memberPsn;

						if (!guildPsn[memberId]) memberPsn = '`UNSET`';
						else memberPsn = guildPsn[memberId].same ? 'same as Discord' : guildPsn[memberId].psn;

						msg += '`' + guildMembers[memberId].username + '` => ' + `\`${memberPsn}\`\n`;
					}

					return message.channel.send(msg);
				}
				else if (subcommand.toLowerCase() === 'unset') {
					let msg = '**Members who have not set their PSN**\n';
					for(const memberId in guildMembers) {
						if (!guildPsn[memberId]) {
							msg += guildMembers[memberId].username + '\n';
						}
					}
					return message.channel.send(msg);
				}
				else if (subcommand.toLowerCase() === 'clear') {
					allPsn[guildId] = {};
					await keyv.set('psn', allPsn);
					return message.channel.send('The Discord->PSN list for this guild was deleted.');
				}
				else if (subcommand.toLowerCase() === 'import') {
					/*
					// TODO rewrite
					const filepath = args[1] || '../discord-psn-list.txt';
					const users = getUsers(filepath);
					console.log('users.length', users.length);
					if (!psn) psn = {};

					const memberUsernames = [];
					members.forEach(member => {
						memberUsernames.push(member.username);
					});

					users.forEach(user => {
						if (memberUsernames.includes(user.discord)) {
							psn[user.discord] = user.psn;
						}
					});
					
					await keyv.set('psn', psn);
					message.channel.send(`Users read from ${filepath}`);
					*/
					return message.channel.send('import command is not functional yet');
				}
				else {
					return message.channel.send('subcommand not recognized.');
				}
			}
		}
	},
};
