module.exports = {
	name: 'args-info',
	description: 'Info about provided arguments.',
	args: true,
	execute(message, args) {
		message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
	},
};
