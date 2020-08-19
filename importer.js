const fs = require('fs');

const getLineObject = line => {
	const split = line.split('/');
	let user = {};
	user.psn = split.shift().trim();
	let remainder = split.join('/');
	remainder = remainder.trimStart();
	
	if (remainder.trimEnd().toLowerCase() === 'same') {
		user.discord = user.psn;
	}
	else {
		user.discord = remainder
	}
	return user;
};

module.exports = {
	getUsers: filepath => {
		const file = fs.readFileSync(filepath, 'utf8');
		const split = file.split('\n');
		const end = split[split.length-1];

		if (end === '' || end === ' ') {
			split.pop();
		}

		const users = [];

		split.forEach(line => users.push(getLineObject(line)));

		return users;
	},
};
