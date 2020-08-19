module.exports = {
	name: 'ping',
	description: 'Ping!',
	cooldown: 15,
	execute: (message) => {
		message.channel.send('pong');
	},
};
