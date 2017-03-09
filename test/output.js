import {serial as test} from 'ava';
import hookStd from 'hook-std';
import {alfy} from './_utils';

const m = alfy();
const hook = cb => {
	const unhook = hookStd.stdout({silent: true}, output => {
		unhook();
		if (cb) {
			cb(output);
		}
	});
};

test.cb('.output() properly wraps item.variables', t => {
	hook(output => {
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
	hook(output => {
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
	hook(output => {
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
	hook();
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

const itemWithMod = {
	title: 'unicorn',
	arg: '🦄',
	variables: {fabulous: true},
	mods: {
		alt: {
			title: 'Rainbow',
			arg: '🌈',
			variables: {
				color: 'myriad'
			}
		}
	}
};

test.cb('.output() wraps mod items', t => {
	hook(output => {
		const item = JSON.parse(output).items[0];
		const altArg = JSON.parse(item.mods.alt.arg);
		t.deepEqual(altArg, {
			alfredworkflow: {
				arg: '🌈',
				variables: {
					color: 'myriad'
				}
			}
		});
		t.end();
	});
	m.output([itemWithMod]);
});

test.cb('.output() doesn\'t change original item when mod items are present', t => {
	hook(output => {
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
	m.output([itemWithMod]);
});
