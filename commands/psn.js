const { getUsers } = require('../modules/importer');
const { ADMINISTRATOR } = require('../helpers/constants');
const logger = require('../modules/logger');
const { getNameFromMessage, splitMessageForLimit } = require('../helpers/utils');

const getGuildMemberByDisplayName = (members, displayName) => {
	for (var i in members) {
		if (members[i].displayName === displayName) {
			return members[i];
		}
	}
	return null;
};

module.exports = {
	name: 'psn',
	description: 'Manage PSNs of Discord users',
	cooldown: 3,
	usage: [
		{ text: 'will show you all the members who have PSNs that are different from their Discord' },
		{ subcommand: 'all', text: 'will show you all members, including ones whose psn is the same as their Discord' },
		{ subcommand: 'unset', text: 'will show you the members who have not set their PSN yet' },
		{ subcommand: 'set DiscordName PSN', text: 'allows you to add a PSN to a Discord user. Note that the DiscordName is case-sensitive' },
		{ subcommand: 'setsame DiscordName', text: 'sets the user\'s PSN the same as their Discord' },
		{ subcommand: 'clear', text: 'will wipe the entire mapping of Discord->PSN for this guild. **Be careful**' },
	],
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			logger.warn(`'${getNameFromMessage(message)}' tried to access the 'psn' command without permission.`);
			return message.channel.send('You do not have permissions to use the `psn` command.');
		}

		const allMembers = await keyv.get('members');
		var guildMembers;
		if (allMembers) {
			guildMembers = allMembers[guildId];
		}

		if (!allMembers || !guildMembers || !Object.keys(guildMembers).length) {
			logger.warn(`'${getNameFromMessage(message)}' ran the 'psn' command without an existing member list.`);
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
			const foundUser = getGuildMemberByDisplayName(guildMembers, args[1]);
			if (!foundUser) {
				logger.warn(`'${getNameFromMessage(message)}' tried to set a member's psn but no member was found.`, args[1]);
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

		if (!Object.keys(guildPsn).length && subcommand !== 'import') {
			// if the guildPsn has no data yet these are the only allowed commands
			const allowed = [ 'set', 'setsame' ];
			if (!subcommand || !allowed.includes(subcommand.toLowerCase())) {
				logger(`'${getNameFromMessage(message)}' tried to show the psn list but one was was not found.`, getISOStamp());
				return message.channel.send('No PSN list found. Try using the `psn set` command');
			}
			else {
				let same;
				if (subcommand.toLowerCase() === 'set') {
					if (!args[1] || !args[2]) {
						logger(`'${getNameFromMessage(message)}' used 'psn set' and received a bad arguments (2) error.`, args[1], args[2], getISOStamp());
						return message.channel.send('You must supply a valid Discord Name and PSN.');
					}
				}
				else {
					if (!args[1]) {
						logger(`'${getNameFromMessage(message)}' used 'psn set' and received a bad arguments (1) error.`, args[1], getISOStamp());
						return message.channel.send('You must supply a valid Discord Name.');
					}
					same = true;
				}
				return await setMemberPsn(same);
			}
		}
		else if (subcommand === 'import') {
			const guildFiles = {
				'743109978440728646': 'test-discord-psn.txt', // test
				'729480893256827012': 'discord-psn-list.txt', // smug
			}

			const filepath = guildFiles[guildId];
			const users = getUsers(filepath);

			const usersNotFound = [];

			users.forEach(user => {
				// find the user's id from guildMembers
				const member = getGuildMemberByDisplayName(guildMembers, user.displayName);
				if (!member) usersNotFound.push(user);
				else guildPsn[member.id] = user.psn;
			});
			
			allPsn[guildId] = guildPsn;
			let msg = `Users read from ${filepath}\n`;
			if (usersNotFound.length) {
				msg += 'These users could not be found\n```';
				usersNotFound.forEach(user => {
					msg += user.displayName + ', ';
				});
				msg += '```';
			}
			await keyv.set('psn', allPsn);
			return message.channel.send(msg);
		}
		else {
			if (!subcommand) {
				let msg = '**Members with set PSNs**\n';
				msg += 'Discord => PSN\n';
				
				for(const memberId in guildPsn) {
					const setTo = guildPsn[memberId].same ? 'same as Discord' : guildPsn[memberId].psn;
					msg += `${guildMembers[memberId].displayName} => ${setTo}\n`;
				}
				msg += '';

				const msgArray = splitMessageForLimit(msg);
				msgArray.forEach(msg => {
					message.channel.send('```' + msg + '```');
				});
				
				return;
			} 
			else {
				if (subcommand.toLowerCase() === 'set') {
					if (!args[1] || !args[2]) {
						logger.warn(`'${getNameFromMessage(message)}' used 'psn set' and received a bad arguments (2) error.`, args[1], args[2]);
						return message.channel.send('You must supply a valid Discord Name and PSN.');
					}
					return await setMemberPsn();
				}
				else if (subcommand.toLowerCase() === 'setsame') {
					if (!args[1]) {
						logger.warn(`'${getNameFromMessage(message)}' used 'psn setsame' and received a bad arguments (1) error.`, args[1]);
						return message.channel.send('You must supply a valid Discord Name.');
					}
					return await setMemberPsn(true);
				}
				else if (subcommand.toLowerCase() === 'all') {
					let msg = '**All Members and their PSNs**\n';
					msg += 'Discord => PS\n';

					for(const memberId in guildMembers) {
						let memberPsn;

						if (!guildPsn[memberId]) memberPsn = 'UNSET';
						else memberPsn = guildPsn[memberId].same ? 'same as Discord' : guildPsn[memberId].psn;

						msg += guildMembers[memberId].displayName + ' => ' + `${memberPsn}\n`;
					}

					const msgArray = splitMessageForLimit(msg);
					msgArray.forEach(msg => {
						message.channel.send('```' + msg + '```');
					});

					return;
				}
				else if (subcommand.toLowerCase() === 'unset') {
					let msg = '```**Members who have not set their PSN**\n';
					for(const memberId in guildMembers) {
						if (!guildPsn[memberId]) {

							msg += guildMembers[memberId].displayName + '\n';
						}
					}
					msg += '```';
					return message.channel.send(msg);
				}
				else if (subcommand.toLowerCase() === 'clear') {
					allPsn[guildId] = {};
					await keyv.set('psn', allPsn);
					logger.info(`'${getNameFromMessage(message)}' used 'psn clear' and deleted the guild's psn list.`);
					return message.channel.send('The Discord->PSN list for this guild was deleted.');
				}
				else {
					return message.channel.send('subcommand not recognized.');
				}
			}
		}
	},
};
