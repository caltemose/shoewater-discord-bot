const { logger } = require('../modules/logger');
const { getNameFromMessage } = require('../helpers/utils');

const getGuildMemberByDisplayName = (members, displayName) => {
	for (var i in members) {
		if (members[i].displayName === displayName) {
			return members[i];
		}
	}
	return null;
};

module.exports = {
	name: 'getpsn',
	description: 'Get PSN of the given user.',
	cooldown: 5,
	execute: async (message, args, keyv, prefix, guildId) => {
		const allPsn = await keyv.get('psn');
		if (!allPsn) {
			logger.warn(`'${getNameFromMessage(message)}' used 'getpsn' and triggered an error`, 'allPsn not defined');
			return message.channel.send('Something is really effed up. Tell @shoewater please.');
		}

		const guildPsn = allPsn[guildId];
		if (!guildPsn) {
			logger.warn(`'${getNameFromMessage(message)}' used 'getpsn' and triggered an error`, 'guildPsn not defined');
			return message.channel.send('The guild\'s PSN list is empty. Tell @shoewater please.');
		}
		
		const allMembers = await keyv.get('members');
		if (!allMembers) {
			logger.warn(`'${getNameFromMessage(message)}' used 'getpsn' and triggered an error`, 'allMembers not defined');
			return message.channel.send('Something is really effed up. Tell @shoewater please.');
		}
		const guildMembers = allMembers[guildId];
		if (!guildMembers) {
			logger.warn(`'${getNameFromMessage(message)}' used 'getpsn' and triggered an error`, 'guildMembers not defined');
			return message.channel.send('The guild member list is empty. Tell @shoewater please.');
		}

		let arg = args[0];

		if (!arg) {
			logger.info(`'${getNameFromMessage(message)}' used 'getpsn' without passing a username to lookup.`);
			return message.channel.send('You must provide a username to lookup for this command to work.');
		}
		
		let member, memberPsn;
		if (arg.startsWith('<@!')) {
			const memberId = arg.substring(3, arg.length-1);
			memberPsn = guildPsn[memberId];
			member = guildMembers[memberId];
		}
		else {
			const memberName = arg.trim();
			member = getGuildMemberByDisplayName(guildMembers, memberName);
			memberPsn = guildPsn[member.id];
		}
		if (member) {
			let msg;

			if (!memberPsn) msg = 'Could not find the psn for the given user.';
			else if (memberPsn.same) msg = member.displayName;
			else if (memberPsn.psn) msg = memberPsn.psn;
			else {
				logger.warn(`'${getNameFromMessage(message)}' used 'getpsn' and triggered an error`, 'member defined, memberPsn defined but jacked up:', memberPsn);
				msg = 'Something is jacked with this member\'s PSN info in our data. Tell @shoewater please.';
			}

			if (!msg) msg = 'Message undefined';

			return message.channel.send(msg);
		}
		else {
			logger.warn(`'${getNameFromMessage(message)}' used 'getpsn' and triggered an error`, 'member not found in members list:', arg);
			return message.channel.send('Member could not be found in the members list. Tell @shoewater please.');
		}
	},
};
