import {serial as test} from 'ava';
import hookStd from 'hook-std';
import {alfy} from './_utils';

const itemWithMod = {
	title: 'unicorn',
	arg: '🦄',
	env: {fabulous: true},
	mods: {
		alt: {
			title: 'Rainbow',
			arg: '🌈',
			env: {
				color: 'myriad'
			}
		}
	}
};

const m = alfy();
const hook = cb => {
	const unhook = hookStd.stdout({silent: true}, output => {
		unhook();
		if (cb) {
			cb(output);
		}
	});
};

test.cb('.output() properly wraps item.env', t => {
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
		env: {fabulous: true}
	}]);
});

test.cb('.output() wraps item.env even if item.arg is not defined', t => {
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
		env: {fabulous: true}
	}]);
});

test('.output() throws if it doesn\'t receive an array of plain objects', t => {
	hook();
	const outputNulls = () => m.output([null, null]);
	t.throws(outputNulls, TypeError);
});

test.cb('.output() does not wrap item.arg if item.env is not defined', t => {
	hook(output => {
		const item = JSON.parse(output).items[0];
		t.is(item.arg, '🦄');
		t.is(item.env, undefined);
		t.end();
	});
	m.output([{
		title: 'unicorn',
		arg: '🦄'
	}]);
});

test('.output() throws a TypeError if its argument isn\'t an array', t => {
	let done = false;
	const unhook = hookStd.stdout({silent: true}, () => {
		if (done) {
			unhook();
		}
	});
	t.throws(() => m.output({}), TypeError);
	t.throws(() => m.output('unicorn'), TypeError);
	t.throws(() => m.output(null), TypeError);
	done = true;
	t.throws(() => m.output(undefined), TypeError);
});

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
