module.exports = (message, msgTxt) => {
	// send a DM to shoewater - used to immediately report errors
	if (message && msgTxt) {
		const user = message.client.users.cache.get('674615784592637963');
		user.send(msgTxt);
	}
};
