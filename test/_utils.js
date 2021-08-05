/* / eslint-disable camelcase */
// import path from 'node:path';
// import {fileURLToPath} from 'node:url';
// import tempfile from 'tempfile';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// TODO: Fix when ESM supports hooks.
// exports.alfy = (options = {}) => {
// 	delete require.cache[path.resolve(__dirname, '../index.js')];

// 	process.env.alfred_workflow_data = options.data || tempfile();
// 	process.env.alfred_workflow_cache = options.cache || tempfile();
// 	process.env.alfred_workflow_version = options.version || '1.0.0';
// 	return require('..');
// };

import alfy from '../index.js';

const createAlfy = () => alfy;

export {createAlfy as alfy};
