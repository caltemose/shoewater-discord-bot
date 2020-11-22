const got = require('got');
const { bungieApiKey } = require('../config.json');

const options = {
	headers: {
		'X-API-KEY': bungieApiKey,
	},
};

const url = 'https://www.bungie.net/Platform/GroupV2/877521/Members/';

module.exports = async () => {
	try {
		const body = await got(url, options).json();
		const members = body.Response.results;
		const results = { members: [] };
		members.forEach(member => {
			results.members.push({
				bungieId: member.destinyUserInfo.membershipId,
				displayName: member.destinyUserInfo.displayName,
			});
		});
		return results;
	}
	catch (err) {
		console.error(err);
		return { error: err };
	}
};

// (async () => {
// 	try {
// 		const body = await got(url, options).json();
// 		const members = body.Response.results;
// 		const results = { members: [] };
// 		members.forEach(member => {
// 			results.members.push({
// 				bungieId: member.destinyUserInfo.membershipId,
// 				displayName: member.destinyUserInfo.displayName,
// 			});
// 		});
// 		console.log(results);
// 	}
// 	catch (err) {
// 		console.error(err);
// 	}

// })();
