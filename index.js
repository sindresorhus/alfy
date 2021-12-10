import os from 'node:os';
import process from 'node:process';
import {createRequire} from 'node:module';
import Conf from 'conf';
import got from 'got';
import hookStd from 'hook-std';
import loudRejection from 'loud-rejection';
import cleanStack from 'clean-stack';
import dotProp from 'dot-prop';
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
			listItem = dotProp.get(listItem, item);
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
		...options,
	};

	if (typeof url !== 'string') {
		return Promise.reject(new TypeError(`Expected \`url\` to be a \`string\`, got \`${typeof url}\``));
	}

	if (options.transform && typeof options.transform !== 'function') {
		return Promise.reject(new TypeError(`Expected \`transform\` to be a \`function\`, got \`${typeof options.transform}\``));
	}

	const rawKey = url + JSON.stringify(options);
	const key = rawKey.replace(/\./g, '\\.');
	const cachedResponse = alfy.cache.get(key, {ignoreMaxAge: true});

	if (cachedResponse && !alfy.cache.isExpired(key)) {
		return Promise.resolve(cachedResponse);
	}

	let response;
	try {
		response = await got(url, {searchParams: options.query}).json();
	} catch (error) {
		if (cachedResponse) {
			return cachedResponse;
		}

		throw error;
	}

	const data = options.transform ? options.transform(response) : response;

	if (options.maxAge) {
		alfy.cache.set(key, data, {maxAge: options.maxAge});
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
hookStd.stderr(alfy.error);

export default alfy;
