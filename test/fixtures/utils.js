/* eslint-disable camelcase */
'use strict';
const path = require('path');
const tempfile = require('tempfile');

exports.alfy = () => {
	delete require.cache[path.resolve(__dirname, '../../index.js')];

	process.env.alfred_workflow_cache = tempfile();
	process.env.alfred_workflow_version = '1.0.0';
	return require('../..');
};
