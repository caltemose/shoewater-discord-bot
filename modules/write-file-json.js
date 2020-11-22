const { writeFile } = require('fs');
const util = require('util');
const path = require('path');

const writeFileAsync = util.promisify(writeFile);

module.exports = async (data, filePath) => {
	const dest = path.join(__dirname, filePath);
	const fileData = JSON.stringify(data, null, 2);

	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const results = await writeFileAsync(dest, fileData);
	return results;
	// fs.writeFile(path, JSON.stringify(data, null, 2), err => {
	// 	if (err) {
	// 		console.error(err);
	// 		throw err;
	// 	}
	// 	console.log('file written to:', path);
	// });
};
