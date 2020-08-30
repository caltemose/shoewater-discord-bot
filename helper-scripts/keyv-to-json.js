const fs = require('fs');
const path = require('path');
const getFileDateStamp = require('../modules/getFileDateStamp');
const logger = require('../modules/logger');

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

keyv.on('error', err => logger.error('Connection Error', err));

const init = async () => {
	const data = {};

	const roles = await keyv.get('roles');
	if (roles) {
		data.roles = roles;
	}
	
	const members = await keyv.get('members');
	if (members) {
		data.members = members;
	}
	
	const psn = await keyv.get('psn');
	if (psn) {
		data.psn = psn;
	}
	const filepath = './backups/keyv-json.' + getFileDateStamp.forNow() + '.json';
	fs.writeFile(filepath, JSON.stringify(data, null, 2), (err) => {
		if (err) logger.error(err);
		else logger.info(`Success writing file: ${filepath}`);
	});

};

init();
