const { getUsers } = require('../importer.js');

const isMember = (username, membersByUsername) => {
	return membersById[username];
};

module.exports = {
	name: 'psn',
	description: 'Manage PSNs of Discord users',
	cooldown: 3,
	usage: `
[psn] will show you all the members who have PSNs that are different from their Discord
[psn all] will show you all members, including ones whose psn is the same as their Discord
[psn add DiscordName PSN] allows you to add a PSN to a Discord user. Note that the DiscordName is case-sensitive
example:  !psn add shoewater shoewatersDifferentPSN
	`,
	execute: async (message, args, keyv) => {
		const members = await keyv.get('members');
		var psn = await keyv.get('psn');
		
		const subcommand = args[0];

		if (!members || !members.length) {
			message.channel.send('No member list found. Run the `members` command first');
			return;
		}

		if (!psn) {
			if (subcommand.toLowerCase() !== 'set') {
				message.channel.send('No PSN list found. Try using the `psn set` command');
				return;
			}
			else {
				// message.channel.send(`Adding ${args[2]} PSN to member ${args[1]}`);
				const found = members.find( ({ username }) => username === args[1]);
				if (!found) {
					message.channel.send(`No member with name ${args[1]} was found.`);
					return;
				}
				else {
					psn = {};
					psn[args[1]] = args[2];
					await keyv.set('psn', psn);
					message.channel.send(`Set PSN of member ${args[1]} to ${args[2]}.`);
				}
			}
		}
		else {
			if (!subcommand) {
				let msg = '**Members with different PSNs**\n';
				msg += '`Discord` => `PSN`\n';
				for(const member in psn) {
					msg += `\`${member}\` => \`${psn[member]}\`\n`;
				}
				message.channel.send(msg);
			} else {
				if (subcommand.toLowerCase() === 'set') {
					const found = members.find( ({ username }) => username === args[1]);
					if (!found) {
						message.channel.send(`No member with name ${args[1]} was found.`);
						return;
					}
					else {
						psn[args[1]] = args[2];
						await keyv.set('psn', psn);
						message.channel.send(`Set PSN of member ${args[1]} to ${args[2]}.`);
					}
				}
				else if (subcommand.toLowerCase() === 'all') {
					let msg = '**All Members and their PSNs**\n';
					msg += '`Discord` => `PSN`\n';
					for(const member in members) {
						const memberpsn = psn[members[member].username];
						msg += '`' + members[member].username + '`';
						if (memberpsn) msg += ` => \`${memberpsn}\``;
						msg += '\n';
					}
					message.channel.send(msg);
				}
				else if (subcommand.toLowerCase() === 'clear') {
					psn = {};
					await keyv.set('psn', psn);
					message.channel.send('The Discord->PSN list was deleted.');
				}
				else if (subcommand.toLowerCase() === 'import') {
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
				}
				else {
					message.channel.send('subcommand not recognized.');
				}
			}
		}
	},
};
