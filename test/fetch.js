/* eslint-disable camelcase */
import path from 'path';
import test from 'ava';
import nock from 'nock';
import delay from 'delay';
import tempfile from 'tempfile';

process.env.AVA = true;

const URL = 'http://foo.bar';

test.before(() => {
	nock(URL).get('/no-cache').times(2).reply(200, {foo: 'bar'});
	nock(URL).get('/cache').once().reply(200, {hello: 'world'});
	nock(URL).get('/cache').twice().reply(200, {hello: 'world!'});
	nock(URL).get('/cache-key?unicorn=rainbow').reply(200, {unicorn: 'rainbow'});
	nock(URL).get('/cache-version').once().reply(200, {foo: 'bar'});
	nock(URL).get('/cache-version').twice().reply(200, {unicorn: 'rainbow'});
});

test.beforeEach(t => {
	process.env.alfred_workflow_cache = tempfile();
	process.env.alfred_workflow_version = '1.0.0';

	delete require.cache[path.resolve('../index.js')];
	t.context.m = require('..');
});

test('no cache', async t => {
	const alfy = t.context.m;
	t.deepEqual(await alfy.fetch(`${URL}/no-cache`), {foo: 'bar'});
	t.falsy(alfy.cache.get(`${URL}/no-cache`));
});

test('transform not a function', async t => {
	const alfy = t.context.m;
	t.throws(alfy.fetch(`${URL}/no-cache`, {transform: 'foo'}), 'Expected `transform` to be a `function`, got `string`');
});

test('transform', async t => {
	const alfy = t.context.m;
	const result = await alfy.fetch(`${URL}/no-cache`, {
		transform: res => {
			res.unicorn = 'rainbow';
			return res;
		}
	});

	t.deepEqual(result, {
		foo: 'bar',
		unicorn: 'rainbow'
	});
});

test('cache', async t => {
	const alfy = t.context.m;

	t.deepEqual(await alfy.fetch(`${URL}/cache`, {maxAge: 5000}), {hello: 'world'});
	t.deepEqual(await alfy.fetch(`${URL}/cache`, {maxAge: 5000}), {hello: 'world'});

	await delay(5000);

	t.deepEqual(await alfy.fetch(`${URL}/cache`, {maxAge: 5000}), {hello: 'world!'});
});

test('cache key', async t => {
	const alfy = t.context.m;

	t.deepEqual(await alfy.fetch(`${URL}/cache-key`, {query: {unicorn: 'rainbow'}, maxAge: 5000}), {unicorn: 'rainbow'});
	t.truthy(alfy.cache.store['http://foo.bar/cache-key{"json":true,"query":{"unicorn":"rainbow"},"maxAge":5000}']);
});

test('invalid version', async t => {
	const alfy = t.context.m;

	t.deepEqual(await alfy.fetch(`${URL}/cache-version`, {maxAge: 5000}), {foo: 'bar'});
	t.deepEqual(await alfy.fetch(`${URL}/cache-version`, {maxAge: 5000}), {foo: 'bar'});

	t.deepEqual(alfy.cache.store['http://foo.bar/cache-version{"json":true,"maxAge":5000}'].data, {
		version: '1.0.0',
		data: {
			foo: 'bar'
		}
	});

	alfy.meta.version = '1.0.1';

	t.deepEqual(await alfy.fetch(`${URL}/cache-version`, {maxAge: 5000}), {unicorn: 'rainbow'});

	t.deepEqual(alfy.cache.store['http://foo.bar/cache-version{"json":true,"maxAge":5000}'].data, {
		version: '1.0.1',
		data: {
			unicorn: 'rainbow'
		}
	});
});
