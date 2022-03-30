import test from 'ava';
import nock from 'nock';
import delay from 'delay';
import tempfile from 'tempfile';
import {alfy as createAlfy} from './_utils.js';

const URL = 'https://foo.bar';

test.before(() => {
	nock(URL).get('/no-cache').times(2).reply(200, {foo: 'bar'});
	nock(URL).get('/cache').once().reply(200, {hello: 'world'});
	nock(URL).get('/cache').twice().reply(200, {hello: 'world!'});
	nock(URL).get('/cache-key?unicorn=rainbow').reply(200, {unicorn: 'rainbow'});
	nock(URL).get('/cache-version').once().reply(200, {foo: 'bar'});
	nock(URL).get('/cache-version').twice().reply(200, {unicorn: 'rainbow'});
	nock(URL).get('/string-response').once().reply(200, 'unicorn is rainbow');
});

test('no cache', async t => {
	const alfy = createAlfy();
	t.deepEqual(await alfy.fetch(`${URL}/no-cache`), {foo: 'bar'});
	t.falsy(alfy.cache.get(`${URL}/no-cache`));
});

test('transform not a function', async t => {
	const alfy = createAlfy();
	await t.throwsAsync(alfy.fetch(`${URL}/no-cache`, {transform: 'foo'}), {message: 'Expected `transform` to be a `function`, got `string`'});
});

test('transform', async t => {
	const alfy = createAlfy();
	const result = await alfy.fetch(`${URL}/no-cache`, {
		transform(response) {
			response.unicorn = 'rainbow';
			return response;
		},
	});

	t.deepEqual(result, {
		foo: 'bar',
		unicorn: 'rainbow',
	});
});

test('cache', async t => {
	const alfy = createAlfy();

	t.deepEqual(await alfy.fetch(`${URL}/cache`, {maxAge: 5000, retry: {}}), {hello: 'world'});
	t.deepEqual(await alfy.fetch(`${URL}/cache`, {maxAge: 5000, retry: {}}), {hello: 'world'});

	await delay(5000);

	t.deepEqual(await alfy.fetch(`${URL}/cache`, {maxAge: 5000, retry: {}}), {hello: 'world!'});
});

test('cache key', async t => {
	const alfy = createAlfy();

	t.deepEqual(await alfy.fetch(`${URL}/cache-key`, {searchParams: {unicorn: 'rainbow'}, maxAge: 5000}), {unicorn: 'rainbow'});
	t.truthy(alfy.cache.store['https://foo.bar/cache-key{"searchParams":{"unicorn":"rainbow"},"maxAge":5000}']);
});

test('invalid version', async t => {
	const cache = tempfile();

	const alfy = createAlfy({cache, version: '1.0.0'});
	t.deepEqual(await alfy.fetch(`${URL}/cache-version`, {maxAge: 5000}), {foo: 'bar'});
	t.deepEqual(await alfy.fetch(`${URL}/cache-version`, {maxAge: 5000}), {foo: 'bar'});
	t.deepEqual(alfy.cache.store['https://foo.bar/cache-version{"maxAge":5000}'].data, {foo: 'bar'});

	const alfy2 = createAlfy({cache, version: '1.0.0'});
	t.deepEqual(await alfy2.fetch(`${URL}/cache-version`, {maxAge: 5000}), {foo: 'bar'});

	/// const alfy3 = createAlfy({cache, version: '1.0.1'});
	// t.deepEqual(await alfy3.fetch(`${URL}/cache-version`, {maxAge: 5000}), {unicorn: 'rainbow'});
	// t.deepEqual(alfy.cache.store['https://foo.bar/cache-version{"maxAge":5000}'].data, {unicorn: 'rainbow'});
});

test('non-JSON response', async t => {
	const alfy = createAlfy();
	t.is(await alfy.fetch(`${URL}/string-response`, {json: false}), 'unicorn is rainbow');
});
