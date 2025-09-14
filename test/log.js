import test from 'ava';
import {hookStdout, hookStderr} from 'hook-std';
import {alfy} from './_utils.js';

const alfyInstance = alfy();

test.serial('alfy.log() writes to stderr without breaking workflow output', async t => {
	const stderrPromise = hookStderr(output => {
		stderrPromise.unhook();
		t.true(output.includes('debug message'));
	});

	const stdoutPromise = hookStdout(output => {
		stdoutPromise.unhook();
		const parsed = JSON.parse(output);
		t.is(parsed.items[0].title, 'Test Item');
	});

	alfyInstance.log('debug message');
	alfyInstance.output([{title: 'Test Item'}]);

	await Promise.all([stderrPromise, stdoutPromise]);
});

test.serial('console.error() works alongside alfy.output()', async t => {
	const stderrPromise = hookStderr(output => {
		stderrPromise.unhook();
		t.true(output.includes('console error'));
	});

	const stdoutPromise = hookStdout(output => {
		stdoutPromise.unhook();
		const parsed = JSON.parse(output);
		t.is(parsed.items[0].title, 'Test Item');
	});

	console.error('console error');
	alfyInstance.output([{title: 'Test Item'}]);

	await Promise.all([stderrPromise, stdoutPromise]);
});

test.serial('multiple logs do not create multiple JSON outputs', async t => {
	let stdoutOutput = '';
	let stderrOutput = '';

	const stderrPromise = hookStderr(output => {
		stderrOutput += output;
		return output;
	});

	const stdoutPromise = hookStdout(output => {
		stdoutOutput += output;
		return output;
	});

	alfyInstance.log('log 1');
	console.error('log 2');
	alfyInstance.log('log 3');
	alfyInstance.output([{title: 'Final'}]);

	await new Promise(resolve => {
		setTimeout(resolve, 10);
	});

	stderrPromise.unhook();
	stdoutPromise.unhook();

	// All logs should be in stderr
	t.true(stderrOutput.includes('log 1'));
	t.true(stderrOutput.includes('log 2'));
	t.true(stderrOutput.includes('log 3'));

	// Only one JSON object in stdout
	t.is((stdoutOutput.match(/{[\s\S]*}/g) || []).length, 1);
});

test.serial('alfy.error() outputs to both stdout and stderr', async t => {
	let stderrOutput = '';

	const stderrPromise = hookStderr(output => {
		stderrOutput += output;
		return output;
	});

	const stdoutPromise = hookStdout(output => {
		stdoutPromise.unhook();
		const parsed = JSON.parse(output);
		t.is(parsed.items[0].title, 'Error: Test error');
		t.false(parsed.items[0].valid);
	});

	alfyInstance.error(new Error('Test error'));
	await stdoutPromise;

	await new Promise(resolve => {
		setTimeout(resolve, 10);
	});

	stderrPromise.unhook();
	t.true(stderrOutput.includes('Error: Test error'));
});

test.serial('alfy.log() handles non-string values', async t => {
	let stderrOutput = '';

	const stderrPromise = hookStderr(output => {
		stderrOutput += output;
		return output;
	});

	alfyInstance.log(123);
	alfyInstance.log(true);
	alfyInstance.log({foo: 'bar'});

	await new Promise(resolve => {
		setTimeout(resolve, 10);
	});

	stderrPromise.unhook();

	t.true(stderrOutput.includes('123'));
	t.true(stderrOutput.includes('true'));
	t.true(stderrOutput.includes('foo'));
});

test.serial('alfy.error() handles string and Error objects correctly', async t => {
	const stdoutPromise1 = hookStdout(output => {
		stdoutPromise1.unhook();
		const parsed = JSON.parse(output);
		t.is(parsed.items[0].title, 'Test string error');
		t.false(parsed.items[0].valid);
	});

	alfyInstance.error('Test string error');
	await stdoutPromise1;

	const stdoutPromise2 = hookStdout(output => {
		stdoutPromise2.unhook();
		const parsed = JSON.parse(output);
		t.is(parsed.items[0].title, 'TypeError: Test type error');
		t.false(parsed.items[0].valid);
	});

	alfyInstance.error(new TypeError('Test type error'));
	await stdoutPromise2;
});

test.serial('outputs empty items array when no output is generated (fixes #82)', async t => {
	const {execaNode} = await import('execa');
	const {writeFileSync, unlinkSync} = await import('node:fs');

	const testScript = `
		import alfy from './index.js';
		alfy.log('Debug message without output');
	`;

	writeFileSync('test-no-output.js', testScript);

	try {
		const {stdout, stderr} = await execaNode('test-no-output.js', [], {
			env: {
				// eslint-disable-next-line camelcase
				alfred_workflow_data: '/tmp/alfy-test',
				// eslint-disable-next-line camelcase
				alfred_workflow_cache: '/tmp/alfy-test',
				// eslint-disable-next-line camelcase
				alfred_workflow_version: '1.0.0',
			},
		});

		// Should output empty items array to prevent Alfred JSON error
		const parsed = JSON.parse(stdout);
		t.deepEqual(parsed.items, []);

		// Debug message should still go to stderr
		t.true(stderr.includes('Debug message without output'));
	} finally {
		unlinkSync('test-no-output.js');
	}
});
