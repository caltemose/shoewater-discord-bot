module.exports = {
	name: 'ping',
	description: 'Ping!',
	cooldown: 5,
	execute: async (message, args) => {
		await keyv.set('ping', 'Pong.');
		message.channel.send('Pong.');
	},
};
