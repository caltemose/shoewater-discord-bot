module.exports = {
	getISOStamp: (dateArg) => {
		return dateArg ? dateArg.toISOString() : new Date().toISOString();
	},

	getNameFromMessage: message => message.member.nickname || message.author.username,
	
	splitMessageForLimit: message => {
		const limit = 2000 - 6;
		const msgSplit = message.split('\n');
		const finalArray =  [];
		let indx = 0;
		for(let i = 0; i < msgSplit.length; i++) {
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
