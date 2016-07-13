import test from 'ava';
import nock from 'nock';
import delay from 'delay';

process.env.AVA = true;
const m = require('..');

const URL = 'http://foo.bar';

test.before(() => {
	m.cache.clear();

	nock(URL).get('/no-cache').reply(200, {foo: 'bar'});
	nock(URL).get('/cache').once().reply(200, {hello: 'world'});
	nock(URL).get('/cache').twice().reply(200, {hello: 'world!'});
});

test('no cache', async t => {
	t.deepEqual(await m.fetch(`${URL}/no-cache`), {foo: 'bar'});
	t.falsy(m.cache.get(`${URL}/no-cache`));
});

test('cache', async t => {
	t.deepEqual(await m.fetch(`${URL}/cache`, {maxAge: 5000}), {hello: 'world'});
	t.deepEqual(await m.fetch(`${URL}/cache`, {maxAge: 5000}), {hello: 'world'});

	await delay(5000);

	t.deepEqual(await m.fetch(`${URL}/cache`, {maxAge: 5000}), {hello: 'world!'});
});
