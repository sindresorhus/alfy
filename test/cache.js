import path from 'path';
import test from 'ava';
import delay from 'delay';

process.env.AVA = true;

test.beforeEach(t => {
	delete require.cache[path.resolve('../index.js')];
	t.context.m = require('..');
});

test('no cache', t => {
	const alfy = t.context.m;
	alfy.cache.set('foo', 'bar');

	t.is(alfy.cache.get('foo'), 'bar');
	t.true(alfy.cache.has('foo'));
});

test('maxAge option', t => {
	const alfy = t.context.m;
	alfy.cache.set('hello', {hello: 'world'}, {maxAge: 300000});

	const age = alfy.cache.store.hello.timestamp - Date.now();

	t.true(age <= 300000 && age >= 299000);
	t.true(alfy.cache.has('hello'));
	t.deepEqual(alfy.cache.get('hello'), {hello: 'world'});
});

test('expired data', async t => {
	const alfy = t.context.m;
	alfy.cache.set('expire', {foo: 'bar'}, {maxAge: 5000});

	t.true(alfy.cache.has('expire'));
	t.deepEqual(alfy.cache.get('expire'), {foo: 'bar'});

	await delay(5000);

	t.false(alfy.cache.has('expire'));
	t.falsy(alfy.cache.get('expire'));
	t.falsy(alfy.cache.store.expire);
});
