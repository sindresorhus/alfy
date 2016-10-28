/* eslint-disable camelcase */
'use strict';
const path = require('path');
const tempfile = require('tempfile');

exports.alfy = options => {
	options = options || {};

	delete require.cache[path.resolve(__dirname, '../index.js')];

	process.env.alfred_workflow_cache = options.cache || tempfile();
	process.env.alfred_workflow_version = options.version || '1.0.0';
	return require('..');
};
