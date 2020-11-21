const { VERSION, ADMINISTRATOR } = require('../modules/constants');
const logger = require('../modules/logger');

module.exports = {
	name: 'dayone',
	description: 'Day One Raid commands',
	cooldown: 1,
	execute: async (message, args, keyv, prefix, guildId) => {
		logger.info(`shoewater bot version ${VERSION}`);
		var raidDayOne = await keyv.get('raidDayOne');
		const myDiscordId = message.member.nickname || message.author.username;
		if (!raidDayOne) {
			raidDayOne = {};
		}
		const subcommand = args.shift();
		if (subcommand === 'join') {
			if (raidDayOne.includes(myDiscordId)) {
				logger.info(`${myDiscordId} tried to join but has already done so.`);
				return message.channel.send(`You've already joined. No need to join again ${myDiscordId}`);
			}
			else {
				logger.info(`$dayone join from ${myDiscordId}`);
				raidDayOne.push(myDiscordId);
				await keyv.set('raidDayOne', raidDayOne);
				return message.channel.send(myDiscordId + ' wants to join the raid.');
			}
		}
		else if (subcommand === 'remove') {
			const found = raidDayOne.indexOf(myDiscordId);
			if (found > -1) {
				logger.info(`$dayone remove from ${myDiscordId}`);
				raidDayOne.splice(found, 1);
				await keyv.set('raidDayOne', raidDayOne);
				return message.channel.send(myDiscordId + ' wants out of the raid squad.');
			}
			else {
				logger.info(`$dayone illegal remove from ${myDiscordId}`);
				return message.channel.send('You were not in the raid so no need to remove yourself.');
			}
		}
		else if (subcommand === 'clear') {
			if (message.member.hasPermission(ADMINISTRATOR)) {
				logger.info(`$dayone clear from ${myDiscordId}`);
				await keyv.set('raidDayOne', []);
				return message.channel.send('cleared the raid list');
			}
		}
		else if (subcommand === 'help' || subcommand === '?') {
			let msg = '**Raid Day One Commands:**\n\n';
			msg += '`$dayone` -> this will show the list of day one raiders\n';
			msg += '`$dayone join` -> this will add you to the list of day one raiders\n';
			msg += '`$dayone remove` -> this will remove you from the list of day one raiders\n';
			logger.info(`$dayone help from ${myDiscordId}`);
			return message.channel.send(msg);
		}
		else if (subcommand === 'message') {
			if (message.member.hasPermission(ADMINISTRATOR)) {
				logger.info(`$dayone message from ${myDiscordId}`);
				let msg = '';
				raidDayOne.forEach(member => msg += `@${member} `);
				return message.channel.send(msg);
			}
		}
		else {
			logger.info(`$dayone (list) from ${myDiscordId}`);
			let msg = '**Members in day one Raid:**\n';
			raidDayOne.forEach(member => msg += ` > ${member}\n`);
			return message.channel.send(msg);
		}
	},
};
