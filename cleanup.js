#!/usr/bin/env node
'use strict';
const execa = require('execa');

execa('alfred-unlink', {localDir: __dirname}).catch(error => {
	console.error(error);
	process.exit(1);
});
