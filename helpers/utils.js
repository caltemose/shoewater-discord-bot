const getDivider = size => {
	let div = '';
	for(let i = 0; i<size; i++) {
		div += '-';
	}
	return `\n${div}\n`;
}

module.exports = {
	logger: function () {
		let msg = getDivider(80) + Array.from(arguments).join('\n') + getDivider(70);
		console.error(msg);
	},

	getISOStamp: (dateArg) => {
		return dateArg ? dateArg.toISOString() : new Date().toISOString();
	},

	getNameFromMessage: message => message.member.nickname || message.author.username
};
