import test from 'ava';
import hookStd from 'hook-std';

process.env.AVA = true;
const m = require('./');

test('default', t => {
	t.false(m.debug);
	t.is(typeof m.icon.error, 'string');
});

test('.error()', t => {
	m.error(new Error('foo'));

	const unhook = hookStd.stdout(output => {
		unhook();
		t.is(JSON.parse(output).items[0].title, 'Error: foo');
	});
});
