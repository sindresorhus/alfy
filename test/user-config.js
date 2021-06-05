import path from 'path';
import test from 'ava';
import {alfy as createAlfy} from './_utils';

test('read user config', t => {
	const alfy = createAlfy({
		data: path.join(__dirname, 'fixtures/config')
	});

	t.is(alfy.userConfig.size, 2);
	t.is(alfy.userConfig.get('unicorn'), '🦄');
	t.is(alfy.userConfig.get('rainbow'), '🌈');
	t.false(alfy.userConfig.has('foo'));
});
