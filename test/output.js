import test from 'ava';
import hookStd from 'hook-std';
import {alfy} from './_utils';

const m = alfy();

test.cb('.output() properly wraps item.variables', t => {
	const unhook = hookStd.stdout({silent: true}, output => {
		unhook();
		const item = JSON.parse(output).items[0];
		const arg = JSON.parse(item.arg);
		t.deepEqual(arg, {
			alfredworkflow: {
				arg: '🦄',
				variables: {fabulous: true}
			}
		});
		t.end();
	});
	m.output([{
		title: 'unicorn',
		arg: '🦄',
		variables: {fabulous: true}
	}]);
});

test.cb('.output() wraps item.variables even if item.arg is not defined', t => {
	const unhook = hookStd.stdout({silent: true}, output => {
		unhook();
		const item = JSON.parse(output).items[0];
		const arg = JSON.parse(item.arg);
		t.deepEqual(arg, {
			alfredworkflow: {
				variables: {fabulous: true}
			}
		});
		t.end();
	});
	m.output([{
		title: 'unicorn',
		variables: {fabulous: true}
	}]);
});

test.cb('.output() does not wrap item.arg if item.variables is not defined', t => {
	const unhook = hookStd.stdout({silent: true}, output => {
		unhook();
		const item = JSON.parse(output).items[0];
		t.is(item.arg, '🦄');
		t.is(item.variables, undefined);
		t.end();
	});
	m.output([{
		title: 'unicorn',
		arg: '🦄'
	}]);
});

test('.output() accepts null and undefined items', t => {
	const unhook = hookStd.stdout({silent: true}, () => unhook());
	t.notThrows(() => m.output([undefined, null]));
});

test('.output() accepts non-arrays', t => {
	let done = false;
	const unhook = hookStd.stdout({silent: true}, () => {
		if (done) {
			unhook();
		}
	});
	t.notThrows(() => m.output({}));
	t.notThrows(() => m.output('unicorn'));
	t.notThrows(() => m.output(null));
	done = true;
	t.notThrows(() => m.output(undefined));
});
