#!/usr/bin/env node
'use strict';
const execa = require('execa');

(async () => {
	try {
		await execa('alfred-link', {
			preferLocal: true,
			localDir: __dirname
		});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
})();

