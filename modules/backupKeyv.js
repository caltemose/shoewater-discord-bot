const { copyFile } = require('fs');
const util = require('util');
const path = require('path');
const getFileDateStamp = require('./getFileDateStamp');

const copyFileAsync = util.promisify(copyFile);

module.exports = (async (srcPath, destFolder) => {
	const src = path.join(__dirname, srcPath);
	const dest = path.join(__dirname, `${destFolder}/keyv.${getFileDateStamp.forNow()}.json`);

	return await copyFileAsync(src, dest);
});
