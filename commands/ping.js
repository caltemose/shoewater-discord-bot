module.exports = {
	name: 'ping',
	description: 'Responds to `ping` with `pong` - used to test server availability.',
	cooldown: 15,
	execute: (message) => {
		return message.channel.send('pong');
	},
};
