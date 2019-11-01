'use strict';
const readPkgUp = require('read-pkg-up');
const alfredNotifier = require('alfred-notifier');

module.exports = async () => {
	const {package: pkg} = await readPkgUp();
	const alfy = pkg.alfy || {};

	if (alfy.updateNotification !== false) {
		alfredNotifier();
	}
};
