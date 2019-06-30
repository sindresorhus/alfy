import test from 'ava';
import delay from 'delay';
import tempfile from 'tempfile';
import {alfy as createAlfy} from './_utils';

test('no cache', t => {
	const alfy = createAlfy();
	alfy.cache.set('foo', 'bar');

	t.is(alfy.cache.get('foo'), 'bar');
	t.true(alfy.cache.has('foo'));
});

test('maxAge option', t => {
	const alfy = createAlfy();
	alfy.cache.set('hello', {hello: 'world'}, {maxAge: 300000});

	const age = alfy.cache.store.hello.timestamp - Date.now();

	t.true(age <= 300000 && age >= 299000);
	t.true(alfy.cache.has('hello'));
	t.deepEqual(alfy.cache.get('hello'), {hello: 'world'});
});

test('expired data', async t => {
	const alfy = createAlfy();
	alfy.cache.set('expire', {foo: 'bar'}, {maxAge: 5000});

	t.true(alfy.cache.has('expire'));
	t.deepEqual(alfy.cache.get('expire'), {foo: 'bar'});

	await delay(5000);

	t.false(alfy.cache.has('expire'));
	t.falsy(alfy.cache.get('expire'));
	t.falsy(alfy.cache.store.expire);
});

test('versioned data', t => {
	const cache = tempfile();

	const alfy = createAlfy({cache, version: '1.0.0'});
	alfy.cache.set('foo', 'bar');

	const alfy2 = createAlfy({cache, version: '1.0.0'});
	t.is(alfy2.cache.get('foo'), 'bar');

	const alfy3 = createAlfy({cache, version: '1.0.1'});
	t.falsy(alfy3.cache.get('foo'));
});
