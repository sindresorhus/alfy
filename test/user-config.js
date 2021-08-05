import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {alfy as createAlfy} from './_utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('read user config', t => {
	const alfy = createAlfy({
		data: path.join(__dirname, 'fixtures/config'),
	});

	// TODO: Fix when ESM supports hooks.
	// t.is(alfy.userConfig.size, 2);
	// t.is(alfy.userConfig.get('unicorn'), '🦄');
	// t.is(alfy.userConfig.get('rainbow'), '🌈');
	// t.false(alfy.userConfig.has('foo'));

	console.log(alfy.userConfig);
	t.pass();
});
