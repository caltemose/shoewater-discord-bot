const compareTwoStrings = require('string-similarity').compareTwoStrings;

const { getNameFromMessage } = require('../modules/utils');
const logger = require('../modules/logger');
const writeFileJson = require('../modules/write-file-json');
const getClanMembers = require('../modules/bungieGetClanMembers');

const { bungieApiKey } = require('../config.json');
const { ADMINISTRATOR } = require('../modules/constants');

// TODO replace these ids with proper usage of keyv and message data
// const clanRole = '730995497258450984'; // smug guild
// const clanRole = '743126625914191974'; // test guild
const testGuildId = '743109978440728646';
// const smugGuildId = '729480893256827012';

const isInBungieClan = (discordName, clanList) => {
	let inClan = false;
	clanList.forEach(clanMember =>{
		if (namesAreSimilar(clanMember.displayName, discordName)) {
			inClan = true;
		}
	});
	return inClan;
};

const namesAreSimilar = (name1, name2) => {
	// this could be refactored to be shorter but is left
	// this way for logging to play around with string-similarity results
	if (name1 === name2) return true;
	const limit = 0.5;
	const comparison = compareTwoStrings(name1, name2) > limit;
	if (name1 !== name2 && comparison > limit) {
		console.log(limit, '!= but close: ', name1, name2);
		return true;
	}

	return false;
};

const isInDiscord = (bungieName, guildMembers) => {
	let inDiscord = false;
	const guildMemberKeys = Object.keys(guildMembers);
	guildMemberKeys.forEach(key => {
		const guildMember = guildMembers[key];
		if (namesAreSimilar(guildMember.displayName, bungieName)) {
			inDiscord = true;
		}
	});
	return inDiscord;
};

const hasClanRole = (discordMember, clanRole) => {
	return discordMember.roles.includes(clanRole);
};

module.exports = {
	name: 'admin',
	description: 'Various administrator functions',
	cooldown: 5,
	execute: async (message, args, keyv, prefix, guildId) => {
		if (!message.member.hasPermission(ADMINISTRATOR)) {
			logger.warn(`'${getNameFromMessage(message)}' tried to access admin commands`);
			return message.channel.send('You do not have permissions to use the `admin` commands.');
		}

		// "743109978440728646": { Test Guild
		// 	"743126625914191974": "Clan Members",
		// 	"743126925907853353": "Mod Admins",
		// 	"743127184721313843": "Dredgens",
		// 	"743464591434055824": "Admins",
		// 	"743464640998015036": "Founder"
		//   },
		//   "729480893256827012": { SMUG Guild
		// 	"729481197872349235": "Charlemagne",
		// 	"729629552850239549": "Friend Time",
		// 	"729640707282960395": "Servant of Niris",
		// 	"729640886559834153": "Bot",
		// 	"729739903428198411": "MEE6",
		// 	"729741454234091551": "Admins",
		// 	"730995497258450984": "Clan Members",
		// 	"731188520894333049": "Mod Admins",
		// 	"732396153852788836": "Dredgens",
		// 	"742135441318477925": "Founder",
		// 	"747812213129216010": "tester"
		//   }

		// TODO update to refer to stored data instead of coded strings
		const clanRole = guildId === testGuildId ? '743126625914191974' : '730995497258450984';

		const subcommand = args[0];
		let results;

		if (subcommand === 'member-report') {
			// get bungie clan list which returns array of { bungieId, displayName }
			try {
				results = await getClanMembers();
				if (results.err) {
					return message.channel.send(`Could not retrieve clan list from Bungie:\n${results.err.toString()}`);
				}
			}
			catch (err) {
				return message.channel.send('Bungie API call failed:\n' + err.toString());
			}

			const bungieMembers = results.members;

			// get members list
			var allMembers = await keyv.get('members');
			if (!allMembers) {
				return message.channel.send('There is no member list.');
			}
			const guildMembers = allMembers[guildId];
			if (!guildMembers) {
				logger.warn(`'${getNameFromMessage(message)}' ran the 'members' command without a members list.`);
				return message.channel.send('There is no member list. Run the `members update` command first.');
			}

			const reportData = {
				notInClan: {
					hasClanRole: [],
					noClanRole: [],
				},
				inClan: {
					hasClanRole: [],
					noClanRole: [],
				},
				notInDiscord: [],
			};

			console.log('1. checking guild members against bungie clan');
			const guildMemberKeys = Object.keys(guildMembers);
			guildMemberKeys.forEach(key => {
				const member = guildMembers[key];
				if (isInBungieClan(member.displayName, bungieMembers)) {
					if (hasClanRole(member, clanRole)) {
						reportData.inClan.hasClanRole.push(member.displayName);
					}
					else reportData.inClan.noClanRole.push(member.displayName);
				}
				else {
					if (hasClanRole(member, clanRole)) {
						reportData.notInClan.hasClanRole.push(member.displayName);
					}
					else reportData.notInClan.noClanRole.push(member.displayName);
				}
			});

			console.log('2. checking clan members against discord guild');
			bungieMembers.forEach(bungieMember => {
				if (!isInDiscord(bungieMember.displayName, guildMembers)) {
					reportData.notInDiscord.push(bungieMember.displayName);
				}
			});

			const filePath = '../backups/member-report.json';
			await writeFileJson(reportData, filePath)
				.catch(err => {
					console.log(err);
					return message.channel.send(`There was an error writing the report file to:\n${filePath}`);
				});
			
			await message.channel.send(`The member report was written to:\n${filePath}\n`);
			
			await message.channel.send(`**Clan members not in Discord:**\n${reportData.notInDiscord.join(', ')}\n`);

			await message.channel.send(`**Discord users who need 'dredgen' role changed to 'clan':**\n${reportData.inClan.noClanRole.join(', ')}\n`);

			return message.channel.send(`**Discord users who need 'clan' role changed to 'dredgen':**\n${reportData.notInClan.hasClanRole.join(', ')}\n`);
		}
		else if (subcommand === 'write-clan') {
			try {
				results = await getClanMembers();
				if (results.err) {
					return message.channel.send(`Could not retrieve clan list from Bungie:\n${results.err.toString()}`);
				}
			}
			catch (err) {
				return message.channel.send('Bungie API call failed:\n' + err.toString());
			}
			
			const bungieMembers = results.members;

			// TODO change clan-list file path to include timestamp and guildId (? or use DB)
			const filePath = '../backups/clan-list.json';
			await writeFileJson(bungieMembers, filePath)
				.catch(err => {
					console.log(err);
					return message.channel.send(`There was an error writing the clan list file to:\n${filePath}`);
				});
			
			return message.channel.send(`The clan list was written to:\n${filePath}`);
		}
	}
};
