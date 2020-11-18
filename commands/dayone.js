const { ADMINISTRATOR } = require('../modules/constants');
const logger = require('../modules/logger');

module.exports = {
	name: 'dayone',
	description: 'Day One Raid commands',
	cooldown: 1,
	execute: async (message, args, keyv, prefix, guildId) => {
		console.log('member.nickname', message.member.nickname, 'author.username', message.author.username);
		const myDiscordId = message.member.nickname || message.author.username;
		var raidDayOne = await keyv.get('raidDayOne');
		if (!raidDayOne) {
			raidDayOne = {};
		}
		const subcommand = args.shift();
		if (subcommand === 'join') {
			raidDayOne.push(myDiscordId);
			await keyv.set('raidDayOne', raidDayOne);
			return message.channel.send(myDiscordId + ' wants to join the raid.');
		}
		else if (subcommand === 'remove') {
			const found = raidDayOne.indexOf(myDiscordId);
			if (found > -1) {
				raidDayOne.splice(found, 1);
				await keyv.set('raidDayOne', raidDayOne);
				return message.channel.send(myDiscordId + ' wants out of the raid squad.');
			}
			else {
				return message.channel.send('You were not in the raid so no need to remove yourself.');
			}
		}
		else if (subcommand === 'clear') {
			if (message.member.hasPermission(ADMINISTRATOR)) {
				await keyv.set('raidDayOne', []);
				return message.channel.send('cleared the raid list');
			}
		}
		else if (subcommand === 'help' || subcommand === '?') {
			let msg = '**Raid Day One Commands:**\n\n';
			msg += '`$dayone` -> this will show the list of day one raiders\n';
			msg += '`$dayone join` -> this will add you to the list of day one raiders\n';
			msg += '`$dayone remove` -> this will remove you from the list of day one raiders\n';
			return message.channel.send(msg);
		}
		else if (subcommand === 'message') {
			if (message.member.hasPermission(ADMINISTRATOR)) {
				let msg = '';
				raidDayOne.forEach(member => msg += `@${member} `);
				return message.channel.send(msg);
			}
		}
		else {
			let msg = '**Members in day one Raid:**\n';
			raidDayOne.forEach(member => msg += ` > ${member}\n`);
			return message.channel.send(msg);
		}
	},
};
