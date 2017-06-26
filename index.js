'use strict';

const os = require('os');
const Conf = require('conf');
const got = require('got');
const hookStd = require('hook-std');
const loudRejection = require('loud-rejection');
const cleanStack = require('clean-stack');
const dotProp = require('dot-prop');
const CacheConf = require('cache-conf');
const moment = require('moment');
const updateNotification = require('./lib/update-notification');

/**
 * Get system icon
 * @param {String} name Icon name
 * @return {String} Icon file path
 */
var getIcon = name => `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/${name}.icns`;

/**
 * Get alfred env
 * @param {String} key Environment variable name (without alfred_ prefix)
 * @return {String}
 */
var getEnv = key => process.env[`alfred_${key}`];

/**
 * Alfy
 * @type {Object}
 */
var alfy = {};

/**
 * Workflow metadata
 * @type {Object}
 */
alfy.meta = {
	name: getEnv('workflow_name'),
	version: getEnv('workflow_version'),
	uid: getEnv('workflow_uid'),
	bundleId: getEnv('workflow_bundleid')
};

/**
 * Alfred metadata
 * @type {Object}
 */
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

/**
 * Config store
 * @type {Conf}
 */
alfy.config = new Conf({
	cwd: alfy.alfred.data
});

/**
 * Cache store
 * @type {CacheConf}
 */
alfy.cache = new CacheConf({
	configName: 'cache',
	cwd: alfy.alfred.cache,
	version: alfy.meta.version
});

/**
 * Update check interval (in minutes)
 * @type {Number|Boolean}
 */
alfy.checkUpdates = 1440;

/**
 * Last update timestamp (in seconds)
 * @type {Number}
 */
alfy.lastUpdate = () => alfy.cache.get('alfy-last-update');

/**
 * Input from Alfred
 * @type {String}
 */
alfy.input = process.argv[2];

/**
 * Output items
 * @param {Array} Workflow items to output
 * @return {String}
 */
alfy.output = arr => {
	// Check for updates
	if (alfy.checkUpdates !== false) {
		if (alfy.checkUpdates === true || alfy.checkUpdates === 0 || !alfy.lastUpdate()) {
			updateNotification();
			alfy.cache.set('alfy-last-update', moment().unix());
		} else if (alfy.checkUpdates > 0) {
			const nextUpdate = moment.unix(alfy.lastUpdate()).add(alfy.checkUpdates, 'minutes');

			if (nextUpdate.isSameOrBefore(moment())) {
				updateNotification();
				alfy.cache.set('alfy-last-update', moment().unix());
			}
		}
	}

	console.log(JSON.stringify({items: arr}, null, '\t'));
};

/**
 * Matches items in list to input case-insensitively
 * @param {String} input Search query.
 * @param {Array} list List with items to match.
 * @param {String|Function} item Item property name to match against or function to handle matching yourself.
 * @return {Array}
 */
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

/**
 * Matches items in list to alfy.input case-insensitively
 * @param {Array} list List with items to match.
 * @param {String|Function} item Item property name to match against or function to handle matching yourself.
 * @return {Array}
 */
alfy.inputMatches = (list, item) => alfy.matches(alfy.input, list, item);

/**
 * Log a string to the console if the debug window is open.
 * @param {String} str String to log
 */
alfy.log = str => {
	console.error(str);
};

/**
 * Display an error or error message in Alfred.
 * @param {Error|String} err Error object or string.
 */
alfy.error = err => {
	const stack = cleanStack(err.stack || err);

	const copy = `
\`\`\`
${stack}
\`\`\`

-
${alfy.meta.name} ${alfy.meta.version}
Alfred ${alfy.alfred.version}
${process.platform} ${process.arch} ${os.release()}
	`.trim();

	alfy.output([{
		title: err.stack ? `${err.name}: ${err.message}` : err,
		subtitle: 'Press ⌘L to see the full error and ⌘C to copy it.',
		valid: false,
		text: {
			copy,
			largetype: stack
		},
		icon: {
			path: alfy.icon.error
		}
	}]);
};

/**
 * Fetch an URL asynchronously and return its response in a Promise
 * @param {String} url URL to fetch.
 * @param {Object} opts Any of the got options.
 * @return {Promise}
 */
alfy.fetch = (url, opts) => {
	opts = Object.assign({
		json: true
	}, opts);

	if (typeof url !== 'string') {
		return Promise.reject(new TypeError(`Expected \`url\` to be a \`string\`, got \`${typeof url}\``));
	}

	if (opts.transform && typeof opts.transform !== 'function') {
		return Promise.reject(new TypeError(`Expected \`transform\` to be a \`function\`, got \`${typeof opts.transform}\``));
	}

	const rawKey = url + JSON.stringify(opts);
	const key = rawKey.replace(/\./g, '\\.');
	const cachedResponse = alfy.cache.get(key, {ignoreMaxAge: true});

	if (cachedResponse && !alfy.cache.isExpired(key)) {
		return Promise.resolve(cachedResponse);
	}

	return got(url, opts)
		.then(res => opts.transform ? opts.transform(res.body) : res.body)
		.then(data => {
			if (opts.maxAge) {
				alfy.cache.set(key, data, {maxAge: opts.maxAge});
			}

			return data;
		})
		.catch(err => {
			if (cachedResponse) {
				return cachedResponse;
			}

			throw err;
		});
};

/**
 * Debug mode enabled
 * @type {Boolean}
 */
alfy.debug = getEnv('debug') === '1';

/**
 * System icons
 * @type {Object}
 */
alfy.icon = {
	get: getIcon,
	info: getIcon('ToolbarInfo'),
	warning: getIcon('AlertCautionIcon'),
	error: getIcon('AlertStopIcon'),
	alert: getIcon('Actions'),
	like: getIcon('ToolbarFavoritesIcon'),
	delete: getIcon('ToolbarDeleteIcon')
};

// Handle uncaught exceptions
loudRejection(alfy.error);
process.on('uncaughtException', alfy.error);
hookStd.stderr(alfy.error);

// Export alfy
module.exports = alfy;
