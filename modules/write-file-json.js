const fs = require('fs');

module.exports = function writeJsonFile (data, path) {
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	fs.writeFile(path, JSON.stringify(data, null, 2), err => {
		if (err) {
			console.error(err);
			throw err;
		}
		console.log('file written to:', path);
	});
};
