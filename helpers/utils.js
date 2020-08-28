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

	getNameFromMessage: message => message.member.nickname || message.author.username,

	// this doesn't avoid the character limit if a single line is greater than 
	// the character limit. limit is currently 2000 so failure is unlikely.
	splitMessageForLimit: message => {
		const limit = 2000 - 6;
		const msgSplit = message.split('\n');
		const finalArray =  [];
		let indx = 0;
		for(let i = 0; i < msgSplit.length - 1; i++) {
			if (!finalArray[indx]) {
				finalArray[indx] = '';
			}
			if (finalArray[indx].length + msgSplit[i].length + 1 < limit) { // + 1 is for added line break below
				finalArray[indx] += msgSplit[i] + '\n';
			}
			else {
				indx++;
				finalArray[indx] = msgSplit[i] + '\n';
			}
		}
		return finalArray;
	},
};
