'use strict';
const readPkgUp = require('read-pkg-up');
const alfredNotifier = require('alfred-notifier');

module.exports = () => {
	readPkgUp().then(result => {
		const alfy = result.pkg.alfy || {};

		if (alfy.updateNotification !== false) {
			alfredNotifier();
		}
	});
};
