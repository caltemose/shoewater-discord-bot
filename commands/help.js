const getCommandHelp = (command, prefix) => {
	var data = [];

	data.push(`**Name:** ${command.name}`);

	if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
	if (command.description) data.push(`**Description:** ${command.description}`);
	
	data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

	if (command.usage) {
		let msg = `**Usage:**\n`;
		command.usage.forEach(usage => {
			if (usage.subcommand) {
				msg += `\`${prefix}${command.name} ${usage.subcommand}\` `;
			}
			else msg += `\`${prefix}${command.name}\` `;
			if (usage.text) msg += ` ${usage.text}`;
			msg += '\n';
		});
		data.push(msg);
	}
	else data.push(' ');

	

	return data;
};

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	usage: [
		{ text: 'lists all commands' },
		{ subcommand: 'all', text: 'lists the full documentation for all commands' },
		{ subcommand: '[command]', text: 'lists the full help for the given command' },
	],
	execute: async (message, args, keyv, prefix, guildId) => {
		let data = [];
		const { commands } = message.client;

		if (!args.length) {
			data.push('Here\'s a list of all my commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command.`);

			return message.channel.send(data, { split: true });
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (name === 'all') {
			data.push('Here is the documentation for all commands.\n');

			commands.each(command => {
				data = data.concat( getCommandHelp(command, prefix) );
				data.push('========================\n');
			});
			
			return message.channel.send(data, { split: true });
		}

		if (!command) {
			return message.reply('That is not a valid command.');
		}
		data = data.concat( getCommandHelp(command, prefix) );

		return message.channel.send(data, { split: true });
	},
};
