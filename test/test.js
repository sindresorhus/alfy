import test from 'ava';
import hookStd from 'hook-std';
import {alfy} from './_utils';

const m = alfy();

m.input = 'Unicorn';

test('default', t => {
	t.false(m.debug);
	t.is(typeof m.icon.error, 'string');
});

test.serial.cb('.error()', t => {
	const unhook = hookStd.stdout({silent: true}, output => {
		unhook();
		t.is(JSON.parse(output).items[0].title, 'Error: foo');
		t.end();
	});

	m.error(new Error('foo'));
});

test('.matches()', t => {
	t.deepEqual(m.matches('Unicorn', ['foo', 'unicorn']), ['unicorn']);
	t.deepEqual(m.matches('Unicorn', [{name: 'foo'}, {name: 'unicorn'}], 'name'), [{name: 'unicorn'}]);
	t.deepEqual(m.matches('Foobar', [{name: 'foo', sub: 'bar'}, {name: 'unicorn', sub: 'rainbow'}], (item, input) => item.name + item.sub === input), [{name: 'foo', sub: 'bar'}]);
});

test('.inputMatches()', t => {
	t.deepEqual(m.inputMatches(['foo', 'unicorn']), ['unicorn']);
});
