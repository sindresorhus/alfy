import test from 'ava';
import {alfy} from './_utils';

const alfyInstance = alfy();

alfyInstance.input = 'Unicorn';

test('default', t => {
	t.false(alfyInstance.debug);
	t.is(typeof alfyInstance.icon.error, 'string');
});

test('.matches()', t => {
	t.deepEqual(alfyInstance.matches('Unicorn', ['foo', 'unicorn']), ['unicorn']);
	t.deepEqual(alfyInstance.matches('Unicorn', [{name: 'foo'}, {name: 'unicorn'}], 'name'), [{name: 'unicorn'}]);
	t.deepEqual(alfyInstance.matches('Foobar', [{name: 'foo', sub: 'bar'}, {name: 'unicorn', sub: 'rainbow'}], (item, input) => item.name + item.sub === input), [{name: 'foo', sub: 'bar'}]);
});

test('.inputMatches()', t => {
	t.deepEqual(alfyInstance.inputMatches(['foo', 'unicorn']), ['unicorn']);
});
