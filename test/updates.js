import test from 'ava';
import hookStd from 'hook-std';
import delay from 'delay';
import moment from 'moment';
import {alfy} from './_utils';

test('disable updates', t => {
	const m = alfy();
	hookStd.stdout({silent: true}, () => {});

	// Ensure we haven't updated before
	t.is(typeof m.lastUpdate(), 'undefined');

	// Disable updates
	m.checkUpdates = false;
	m.output([{
		title: 'Test'
	}]);

	// Ensure we haven't updated
	t.is(typeof m.lastUpdate(), 'undefined');
});

test('update', async t => {
	const m = alfy();
	hookStd.stdout({silent: true}, () => {});

	// Ensure we haven't updated before
	t.is(typeof m.lastUpdate(), 'undefined');

	// Enable updates
	m.checkUpdates = 14400;

	// Output (and check for updates)
	m.output([{
		title: 'Test'
	}]);

	const lastUpdate = m.lastUpdate();

	// Ensure we updated
	t.not(typeof lastUpdate, 'undefined');
	t.true(lastUpdate <= moment().unix());
	t.true(lastUpdate > 0);

	await delay(2000);

	// Output (and check for updates)
	m.output([{
		title: 'Test'
	}]);

	// Ensure we haven't updated
	t.is(m.lastUpdate(), lastUpdate);
});

test('always update', async t => {
	const m = alfy();
	hookStd.stdout({silent: true}, () => {});

	// Ensure we haven't updated before
	t.is(typeof m.lastUpdate(), 'undefined');

	// Enable updates (always)
	m.checkUpdates = true;

	// Output (and check for updates)
	m.output([{
		title: 'Test'
	}]);

	const lastUpdate = m.lastUpdate();

	// Ensure we updated
	t.not(typeof lastUpdate, 'undefined');
	t.true(lastUpdate <= moment().unix());
	t.true(lastUpdate > 0);

	await delay(2000);

	// Output (and check for updates)
	m.output([{
		title: 'Test'
	}]);

	// Make sure we have updated
	t.not(typeof m.lastUpdate(), 'undefined');
	t.true(m.lastUpdate() <= moment().unix());
	t.true(m.lastUpdate() > lastUpdate);
});
