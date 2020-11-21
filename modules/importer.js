const fs = require('fs');

const getLineObject = line => {
	const split = line.split('/');
	
	let user = {};
	user.psn = {};
	const psnString = split.shift().trim();

	let remainder = split.join('/');
	remainder = remainder.trimStart();
	
	if (remainder.trimEnd().toLowerCase() === 'same') {
		user.displayName = user.psn.displayName = psnString;
		user.psn.same = true;
	}
	else {
		user.displayName = user.psn.displayName = remainder;
		user.psn.psn = psnString;
	}
	return user;
};

module.exports = {
	getUsers: filepath => {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
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
