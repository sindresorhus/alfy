#!/usr/bin/env node
'use strict';
const execa = require('execa');

execa('alfred-link', {localDir: __dirname}).catch(error => {
	console.error(error);
	process.exit(1);
});
