const backupKeyv = require('./modules/backupKeyv');

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
