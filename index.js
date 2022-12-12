import os from 'node:os';
import process from 'node:process';
import {createRequire} from 'node:module';
import Conf from 'conf';
import got from 'got';
import {hookStderr} from 'hook-std';
import loudRejection from 'loud-rejection';
import cleanStack from 'clean-stack';
import {getProperty} from 'dot-prop';
import AlfredConfig from 'alfred-config';
import updateNotification from './lib/update-notification.js';

const require = createRequire(import.meta.url);
const CacheConf = require('cache-conf');

const alfy = {};

updateNotification();

const getIcon = name => `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/${name}.icns`;
const getEnv = key => process.env[`alfred_${key}`];

alfy.meta = {
	name: getEnv('workflow_name'),
	version: getEnv('workflow_version'),
	uid: getEnv('workflow_uid'),
	bundleId: getEnv('workflow_bundleid'),
};

alfy.alfred = {
	version: getEnv('version'),
	theme: getEnv('theme'),
	themeBackground: getEnv('theme_background'),
	themeSelectionBackground: getEnv('theme_selection_background'),
	themeSubtext: Number(getEnv('theme_subtext')),
	data: getEnv('workflow_data'),
	cache: getEnv('workflow_cache'),
	preferences: getEnv('preferences'),
	preferencesLocalHash: getEnv('preferences_localhash'),
};

alfy.input = process.argv[2];

alfy.output = (items, {rerunInterval} = {}) => {
	console.log(JSON.stringify({items, rerun: rerunInterval}, null, '\t'));
};

alfy.matches = (input, list, item) => {
	input = input.toLowerCase().normalize();

	return list.filter(listItem => {
		if (typeof item === 'string') {
			listItem = getProperty(listItem, item);
		}

		if (typeof listItem === 'string') {
			listItem = listItem.toLowerCase().normalize();
		}

		if (typeof item === 'function') {
			return item(listItem, input);
		}

		return listItem.includes(input);
	});
};

alfy.inputMatches = (list, item) => alfy.matches(alfy.input, list, item);

alfy.log = text => {
	console.error(text);
};

alfy.error = error => {
	const stack = cleanStack(error.stack || error);

	const copy = `
\`\`\`
${stack}
\`\`\`

-
${alfy.meta.name} ${alfy.meta.version}
Alfred ${alfy.alfred.version}
${process.platform} ${os.release()}
	`.trim();

	alfy.output([{
		title: error.stack ? `${error.name}: ${error.message}` : error,
		subtitle: 'Press ⌘L to see the full error and ⌘C to copy it.',
		valid: false,
		text: {
			copy,
			largetype: stack,
		},
		icon: {
			path: alfy.icon.error,
		},
	}]);
};

alfy.config = new Conf({
	cwd: alfy.alfred.data,
});

alfy.userConfig = new AlfredConfig();

alfy.cache = new CacheConf({
	configName: 'cache',
	cwd: alfy.alfred.cache,
	version: alfy.meta.version,
});

alfy.fetch = async (url, options) => {
	options = {
		resolveBodyOnly: true,
		...options,
	};

	// TODO: Remove this in 2024.
	if (options.query) {
		throw new Error('The `query` option was renamed to `searchParams`.');
	}

	if (typeof url !== 'string') {
		throw new TypeError(`Expected \`url\` to be a \`string\`, got \`${typeof url}\``);
	}

	if (options.transform && typeof options.transform !== 'function') {
		throw new TypeError(`Expected \`transform\` to be a \`function\`, got \`${typeof options.transform}\``);
	}

	const rawKey = url + JSON.stringify(options);

	// This must be below the cache key generation.
	const {transform, maxAge} = options;
	delete options.transform;
	delete options.maxAge;

	const key = rawKey.replace(/\./g, '\\.');
	const cachedResponse = alfy.cache.get(key, {ignoreMaxAge: true});

	if (cachedResponse && !alfy.cache.isExpired(key)) {
		return cachedResponse;
	}

	if ('json' in options && options.json === false) {
		delete options.json;
		options.responseType = 'text';
	} else {
		options.responseType = 'json';
	}

	let response;
	try {
		response = await got(url, options);
	} catch (error) {
		if (cachedResponse) {
			return cachedResponse;
		}

		throw error;
	}

	const data = transform ? transform(response) : response;

	if (maxAge) {
		alfy.cache.set(key, data, {maxAge});
	}

	return data;
};

alfy.debug = getEnv('debug') === '1';

alfy.icon = {
	get: getIcon,
	info: getIcon('ToolbarInfo'),
	warning: getIcon('AlertCautionIcon'),
	error: getIcon('AlertStopIcon'),
	alert: getIcon('Actions'),
	like: getIcon('ToolbarFavoritesIcon'),
	delete: getIcon('ToolbarDeleteIcon'),
};

loudRejection(alfy.error);
process.on('uncaughtException', alfy.error);
hookStderr(alfy.error);

export default alfy;
