const fs = require('fs');
const path = require('path');
const getFileDateStamp = require('../modules/getFileDateStamp');

const Keyv = require('keyv');
const KeyvFile = require('keyv-file').KeyvFile;

const keyv = new Keyv({
	store: new KeyvFile({
		filename: path.join(__dirname, '../keyv.json'),
		writeDelay: 100,
		encode: JSON.stringify,
		decode: JSON.parse,
	})
});

keyv.on('error', err => console.error('Connection Error', err));

const init = async () => {
	const DIV = '============================================================';
	
	const data = {};

	const roles = await keyv.get('roles');
	if (roles) {
		data.roles = roles;
		// console.log(roles);
		// console.log(DIV);
	}
	
	const members = await keyv.get('members');
	if (members) {
		data.members = members;
		// console.log(members);
		// console.log(DIV);
	}
	
	const psn = await keyv.get('psn');
	if (psn) {
		data.psn = psn;
		// console.log(psn);
	}

	fs.writeFile('./backups/keyv-json.' + getFileDateStamp.forNow() + '.json', JSON.stringify(data, null, 2), (err) => {
		if (err) console.log(err);
		else console.log('success writing file');
	});

};

init();
