#!/usr/bin/env node
'use strict';
const execa = require('execa');
const npmRunPath = require('npm-run-path');

const env = npmRunPath.env({cwd: __dirname});

execa('alfred-link', {env}).catch(err => {
	console.error(err);
	process.exit(1);
});
