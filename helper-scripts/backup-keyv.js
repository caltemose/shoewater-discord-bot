/**
 * This script is used manually from the terminal to backup the main
 * keyv.json file. It is mostly for testing since the keyv.json file
 * can be backed up from Discord using the command `data backup`
 */

const backupKeyv = require('../modules/backupKeyv');

const goBackupKeyv = async () => {
	try {
		await backupKeyv('../keyv.json', '../backups');
		console.log('keyv file has been backed up.');
	} catch (err) {
		console.error('! keyv WAS NOT backed up.');
		console.error('err', err);
	}
};

goBackupKeyv();
