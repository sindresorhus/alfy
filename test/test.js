import test from 'ava';
import {hookStdout} from 'hook-std';
import updateNotification from '../lib/update-notification.js';
import {alfy} from './_utils.js';

const alfyInstance = alfy();

alfyInstance.input = 'Unicorn';

test('default', t => {
	t.false(alfyInstance.debug);
	t.is(typeof alfyInstance.icon.error, 'string');
});

test.serial('.output() with variables', async t => {
	const promise = hookStdout(output => {
		promise.unhook();
		const result = JSON.parse(output);
		t.deepEqual(result.variables, {animal: 'unicorn'});
		t.is(result.items[0].title, 'Unicorn');
	});

	alfyInstance.output(
		[{title: 'Unicorn'}],
		{variables: {animal: 'unicorn'}},
	);

	await promise;
});

test.serial('.output() without variables', async t => {
	const promise = hookStdout(output => {
		promise.unhook();
		const result = JSON.parse(output);
		t.is(result.variables, undefined);
		t.is(result.items[0].title, 'Unicorn');
	});

	alfyInstance.output([{title: 'Unicorn'}]);

	await promise;
});

test.serial('.error()', async t => {
	const promise = hookStdout(output => {
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

test('updateNotification handles missing package.json gracefully', async t => {
	// This test verifies that updateNotification doesn't throw when no package.json is found
	// The function should handle the case where readPackageUp returns undefined
	await t.notThrowsAsync(updateNotification);
});
