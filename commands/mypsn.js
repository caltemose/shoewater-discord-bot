const { logger, getISOStamp, getNameFromMessage } = require('../helpers/utils');

const getDisplayNameById = (members, id) => {
	for (var i in members) {
		if (i === id) {
			return members[i].displayName;
		}
	}
	return null;
};

module.exports = {
	name: 'mypsn',
	description: 'Manage what Discord thinks is your PSN (this does not affect your actual Sony PSN in any way).',
	cooldown: 3,
	usage: [
		{ text: 'shows you what your PSN is set to in this Discord guild.' },
		{ subcommand: 'set myNewPsn', text: 'lets you associate the given PSN with your Discord name.' },
		{ subcommand: 'setsame', text: 'sets your PSN to the same as your Discord name' },
	],
	execute: async (message, args, keyv, prefix, guildId) => {
		const allMembers = await keyv.get('members');
		var guildMembers;
		if (allMembers) {
			guildMembers = allMembers[guildId];
		}

		if (!allMembers || !guildMembers || !Object.keys(guildMembers).length) {
			logger(`'${getNameFromMessage(message)}' used 'mypsn' and triggered an error`, 'memberlist not found', getISOStamp());
			return message.channel.send('No member list found. Report this to @shoewater please.');
		}
		
		const myDiscordId = message.author.id;
		if (!guildMembers[myDiscordId]) {
			// TODO this should add the member to the members list properly
			logger(`'${getNameFromMessage(message)}' used 'mypsn' and their user was not found in the member list.`, getISOStamp());
			return message.channel.send('Your Discord user was not found in the members list. Report this to @shoewater please.');
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

		const myCurrentPsnObj = guildPsn[myDiscordId];
		
		const subcommand = args.shift();
		
		const myNewPsn = args.join(' ');

		if (!subcommand) {
			var msg = '';
			if (!myCurrentPsnObj) {
				msg = 'You have not setup your PSN for your Discord user yet.';
			}
			else if (myCurrentPsnObj.same) {
				const displayName = getDisplayNameById(guildMembers, message.author.id);
				msg = `Your PSN is the same as your Discord username: \`${displayName}\``;
			}
			else if (myCurrentPsnObj.psn) {
				msg = `Your PSN is: \`${myCurrentPsnObj.psn}\``;
			}
			else {
				msg = `Something's wonky. Contact an admin please.`;
			}
			return message.channel.send(msg);
		}
		
		if (subcommand === 'set') {
			if (!myNewPsn) {
				logger(`'${getNameFromMessage(message)}' used 'mypsn set' without a valid PSN.`, getISOStamp());
				return message.channel.send(`You must supply a valid PSN: \`${prefix}mypsn set validPSNtag\``);
			}
			else {
				// TODO check to see this doesn't clash with an existing PSN in the database

				guildPsn[message.author.id] = { psn: myNewPsn };
				allPsn[guildId] = guildPsn;
				await keyv.set('psn', allPsn);

				return message.channel.send(`Your PSN is now set to: \`${myNewPsn}\``);
			}
		}
		else if (subcommand === 'setsame') {
			guildPsn[message.author.id] = { same: true };
			allPsn[guildId] = guildPsn;
			await keyv.set('psn', allPsn);

			return message.channel.send('Your PSN has been set to the same as your Discord name.');
		}
		
	},
};
