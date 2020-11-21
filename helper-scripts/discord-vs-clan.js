const fs = require('fs');
const path = require('path');
const botData = require('../backups/keyv-json.2020-11-19_10-20-42-605.json');
const clanList = require('../backups/clan-list.js');
const smugId = '729480893256827012';
const roleClan = '730995497258450984';
const roleDredgen = '732396153852788836';
const discordMembers = botData.members[smugId];
/*
determine 
- how many clan members aren't in discord
- how many discord members have the wrong role
- if in clan, role equal 

"id": "521503705187745802",
"username": "Lego Freak",
"nickname": null,
"displayName": "Lego Freak",
"roles": [
	"732396153852788836"
]

Roles:
"730995497258450984": "Clan Members",
"732396153852788836": "Dredgens",		
*/

const addClanRole = [];
const removeClanRole = [];

for(var i in discordMembers) {
	const discordMember = discordMembers[i];
	// is discord member is in the clan
	if (clanList.includes(discordMember.displayName)) {
		// if the discord member doesn't have the clan role
		if (discordMember.roles.includes(roleDredgen)) {
			// add to array of discord members who need clan role added and dredgen removed
			addClanRole.push(discordMember);
		}
	}
	else {
		// discord member is not in clan
		// do they have the clan role?
		if (discordMember.roles.includes(roleClan)) {
			// if so add to the list of members who need clan role removed
			removeClanRole.push(discordMember);
		}
	}
}

// console.log('addClanRole.length', addClanRole.length);
// console.log('removeClanRole.length', removeClanRole.length);
console.log(addClanRole);
console.log('\n\n');
console.log(removeClanRole);
