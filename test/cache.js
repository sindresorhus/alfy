import test from 'ava';
import delay from 'delay';
import {alfy} from './_utils';

process.env.AVA = true;

test('no cache', t => {
	const m = alfy();
	m.cache.set('foo', 'bar');

	t.is(m.cache.get('foo'), 'bar');
	t.true(m.cache.has('foo'));
});

test('maxAge option', t => {
	const m = alfy();
	m.cache.set('hello', {hello: 'world'}, {maxAge: 300000});

	const age = m.cache.store.hello.timestamp - Date.now();

	t.true(age <= 300000 && age >= 299000);
	t.true(m.cache.has('hello'));
	t.deepEqual(m.cache.get('hello'), {hello: 'world'});
});

test('expired data', async t => {
	const m = alfy();
	m.cache.set('expire', {foo: 'bar'}, {maxAge: 5000});

	t.true(m.cache.has('expire'));
	t.deepEqual(m.cache.get('expire'), {foo: 'bar'});

	await delay(5000);

	t.false(m.cache.has('expire'));
	t.falsy(m.cache.get('expire'));
	t.falsy(m.cache.store.expire);
});
