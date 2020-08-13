const fs = require('fs');
const Discord = require('discord.js');
const { token, prefix } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
	// ignore messages with no prefix or if coming from a bot
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	// ignore message if given command isn't recognized
	if (!client.commands.has(commandName)) return;

	const command = client.commands.get(commandName);

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments.`;
		if (command.usage) {
			reply += `\nThe proper usage is: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationtime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}
	else {
		timestamps.set(message.author.id, now);
		setTimeout(()  => timestamps.delete(message.author.id), cooldownAmount);
	}

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command.');
	}

});

client.on('shardError', error => {
	console.error('A websocket connection encountered an error:', error);
	/*
	ECONNRESET - The connection was forcibly closed by a peer, thrown by the loss of connection to a websocket due to timeout or reboot.
	ETIMEDOUT - A connect or send request failed because the receiving party did not respond after some time.
	EPIPE - The remote side of the stream being written to has been closed.
	ENOTFOUND - The domain being accessed is unavailable, usually caused by a lack of internet, can be thrown by the websocket and http API.
	ECONNREFUSED - The target machine refused the connection, check your ports and firewall.
	*/
});

client.login(token);

