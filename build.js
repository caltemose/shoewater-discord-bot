/*
create /dst folder with assets for server:

simply copy:
------------
package.json
package-lock.json

minify and copy:
----------------
app.js
commands/*
helpers/*
modules/*
*/

const fs = require('fs');
const path = require('path');
const del = require('del');

const dest = path.join(__dirname, 'dst');

(async () => {
	await del(dest);
})();

