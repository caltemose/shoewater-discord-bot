const fs = require('fs');
const Discord = require('discord.js');
const { token, defaultPrefix } = require('./config.json');
const logger = require('./modules/logger');

//
// data storage via Keyv
// currently using local JSON file
//

const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile;
const path = require('path');

const keyv = new Keyv({
	store: new KeyvFile({
		// eslint-disable-next-line no-undef
		filename: path.join(__dirname, 'keyv.json'),
		writeDelay: 100,
		encode: JSON.stringify,
		decode: JSON.parse,
	})
});

keyv.on('error', err => logger.error('Connection Error', err));

//
// initialize discord client and commands
//

const client = new Discord.Client();
client.commands = new Discord.Collection();

const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	// eslint-disable-next-line security/detect-non-literal-require
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

//
// Discord event listeners
//

client.once('ready', () => {
	logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {

	// ignore commands from bots
	if (message.author.bot) return;

	// get guilds object from store
	const guilds = await keyv.get('guilds');
	const guildId = message.guild.id;
	let prefix = defaultPrefix;

	if (!guilds || !guilds[guildId]) {
		if (!guilds) {
			const guildObj = {};
			guildObj[guildId] = { guildName: message.guild.name };
			await keyv.set('guilds', guildObj);
			// console.log('no guilds object, setting one', guildObj);
		}
		else if (!guilds[guildId]) {
			guilds[guildId] = { guildName: message.guild.name };
			await keyv.set('guilds', guilds);
			// console.log('no matching guildId in guilds object, setting one', guilds);
		}
	}
	else {
		if (guilds[guildId].guildPrefix) {
			prefix = guilds[guildId].guildPrefix;
		}
		// console.log(`The prefix for this guild is ${prefix}`);
	}

	// ignore messages that do not start with the prefix for this guild
	if (!message.content.startsWith(prefix)) return;


	// get possible command and arguments from the message
	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	// ignore message if given command isn't recognized
	if (!client.commands.has(commandName)) return;

	const command = client.commands.get(commandName);

	if (command.args && !args.length) {
		let reply = 'You didn\'t provide any arguments.';
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
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}
	else {
		timestamps.set(message.author.id, now);
		setTimeout(()  => timestamps.delete(message.author.id), cooldownAmount);
	}

	try {
		command.execute(message, args, keyv, prefix, guildId);
	} catch (error) {
		logger.error(error);
		message.reply('there was an error trying to execute that command.');
	}

});

client.on('shardError', error => {
	logger.error('A websocket connection encountered an error:', error);
	/*
	ECONNRESET - The connection was forcibly closed by a peer, thrown by the loss of connection to a websocket due to timeout or reboot.
	ETIMEDOUT - A connect or send request failed because the receiving party did not respond after some time.
	EPIPE - The remote side of the stream being written to has been closed.
	ENOTFOUND - The domain being accessed is unavailable, usually caused by a lack of internet, can be thrown by the websocket and http API.
	ECONNREFUSED - The target machine refused the connection, check your ports and firewall.
	*/
});

//
// login to Discord to get started
//

client.login(token);


/**
 * This is used only for hosting on Dreamhost so that a public URL can be hit
 * to determine if the bot is running *and* because Dreamhost uses Passenger
 * which needs to have a live page hit in order to fire up the node app.
 * Note that the port in this case is overwritten by Passenger as port 80/443.
 */
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'production') {
	const http = require('http');

	http.createServer(function(request, response) {
		response.writeHead(200, {'Content-Type': 'text/plain'});
		response.write('shoebot running');
		response.end();
	}).listen(8888);
}
