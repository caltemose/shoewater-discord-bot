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
			if (subcommand.toLowerCase() !== 'add') {
				message.channel.send('No PSN list found. Try using the `psn add` command');
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
				for(const member in psn) {
					msg += `${member} with PSN = ${psn[member]}\n`;
				}
				message.channel.send(msg);
			} else {
				if (subcommand.toLowerCase() === 'add') {
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
					for(const member in members) {
						const memberpsn = psn[members[member].username];
						msg += members[member].username;
						if (memberpsn) msg += ` / ${memberpsn}`;
						msg += '\n';
					}
					message.channel.send(msg);
				}
				else if (subcommand.toLowerCase() === 'clear') {
					psn = {};
					await keyv.set('psn', psn);
					message.channel.send('The Discord->PSN list was deleted.');
				}
				else {
					message.channel.send('subcommand not recognized.');
				}
			}
		}
	},
};
