'use strict';
const os = require('os');
const Conf = require('conf');
const got = require('got');
const hookStd = require('hook-std');
const loudRejection = require('loud-rejection');
const cleanStack = require('clean-stack');
const dotProp = require('dot-prop');
const CacheConf = require('cache-conf');
const updateNotification = require('./lib/update-notification');

const alfy = module.exports;

updateNotification();

const getIcon = name => `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/${name}.icns`;
const getEnv = key => process.env[`alfred_${key}`];

alfy.meta = {
	name: getEnv('workflow_name'),
	version: getEnv('workflow_version'),
	uid: getEnv('workflow_uid'),
	bundleId: getEnv('workflow_bundleid')
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
	preferencesLocalHash: getEnv('preferences_localhash')
};

alfy.input = process.argv[2];

alfy.output = items => {
	console.log(JSON.stringify({items}, null, '\t'));
};

alfy.matches = (input, list, item) => {
	input = input.toLowerCase().normalize();

	return list.filter(x => {
		if (typeof item === 'string') {
			x = dotProp.get(x, item);
		}

		if (typeof x === 'string') {
			x = x.toLowerCase();
		}

		if (typeof item === 'function') {
			return item(x, input);
		}

		return x.includes(input);
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
			largetype: stack
		},
		icon: {
			path: exports.icon.error
		}
	}]);
};

alfy.config = new Conf({
	cwd: alfy.alfred.data
});

alfy.cache = new CacheConf({
	configName: 'cache',
	cwd: alfy.alfred.cache,
	version: alfy.meta.version
});

alfy.fetch = async (url, options) => {
	options = {
		json: true,
		...options
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
		response = await got(url, options);
	} catch (error) {
		if (cachedResponse) {
			return cachedResponse;
		}

		throw error;
	}

	const data = options.transform ? options.transform(response.body) : response.body;

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
	delete: getIcon('ToolbarDeleteIcon')
};

loudRejection(alfy.error);
process.on('uncaughtException', alfy.error);
hookStd.stderr(alfy.error);
