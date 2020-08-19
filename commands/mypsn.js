const { prefix } = require('../config.json');

module.exports = {
	name: 'mypsn',
	description: 'Manage what Discord thinks is your PSN (this does not affect your actual Sony PSN in any way).',
	cooldown: 3,
	usage: `
'mypsn' shows you what your PSN is set to
'mypsn set my new psn tag' lets you set your PSN
'mypsn clear' sets your PSN to the same as your Discord username
**DISCLAIMER: this does not have any affect on your real PSN with Sony/Playstation network. It is only stored in our Discord server.**
	`,
	execute: async (message, args, keyv) => {
		var psn = await keyv.get('psn');
		const myCurrentPsn = psn[message.author.username];
		
		const subcommand = args.shift();
		const myNewPsn = args.join(' ');

		if (!subcommand) {
			return myCurrentPsn ?
				message.channel.send(`Your PSN is: \`${myCurrentPsn}\``) 
				:
				message.channel.send(`Your PSN is the same as your Discord username: \`${message.author.username}\``);
		}
		else if (subcommand === 'set') {
			if (!myNewPsn) {
				return message.channel.send(`You must supply a valid PSN: ${prefix}mypsn set validPSNtag`);
			}
			else {
				// TODO check to see this doesn't clash with an existing PSN in the database

				psn[message.author.username] = myNewPsn;
				await keyv.set('psn', psn);

				return message.channel.send(`Your PSN is now set to: \`${myNewPsn}\``);
			}
		}
		else if (subcommand === 'clear') {
			delete psn[message.author.username];
			await keyv.set('psn', psn);
			return message.channel.send('Your PSN has been cleared.');
		}
		
	},
};
