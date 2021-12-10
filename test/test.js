import test from 'ava';
import hookStd from 'hook-std';
import {alfy} from './_utils.js';

const alfyInstance = alfy();

alfyInstance.input = 'Unicorn';

test('default', t => {
	t.false(alfyInstance.debug);
	t.is(typeof alfyInstance.icon.error, 'string');
});

test.serial('.error()', async t => {
	const promise = hookStd.stdout(output => {
		promise.unhook();
		t.is(JSON.parse(output).items[0].title, 'Error: foo');
	});

	alfyInstance.error(new Error('foo'));

	await promise;
});

test('.matches()', t => {
	t.deepEqual(alfyInstance.matches('Unicorn', ['foo', 'unicorn']), ['unicorn']);
	t.deepEqual(alfyInstance.matches('Unicorn', [{name: 'foo'}, {name: 'unicorn'}], 'name'), [{name: 'unicorn'}]);
	t.deepEqual(alfyInstance.matches('Foobar', [{name: 'foo', sub: 'bar'}, {name: 'unicorn', sub: 'rainbow'}], (item, input) => item.name + item.sub === input), [{name: 'foo', sub: 'bar'}]);
});

test('.inputMatches()', t => {
	t.deepEqual(alfyInstance.inputMatches(['foo', 'unicorn']), ['unicorn']);
	alfyInstance.input = 'Ünicörn';
	t.deepEqual(alfyInstance.inputMatches(['foo', 'unicorn']), []);
	t.deepEqual(alfyInstance.inputMatches(['foo', 'ünicörn']), ['ünicörn']);
});
