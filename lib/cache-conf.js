'use strict';
const Conf = require('conf');

const isExpired = item => item && item.timestamp && item.timestamp < Date.now();

class CacheConf extends Conf {

	get(key) {
		const ret = super.get(key);

		if (isExpired(ret)) {
			super.delete(key);
			return;
		}

		return ret.data;
	}

	set(key, val, opts) {
		opts = opts || {};

		super.set(key, {
			timestamp: opts.maxAge && Date.now() + opts.maxAge,
			data: val
		});
	}

	has(key) {
		if (!super.has(key)) {
			return false;
		}

		if (isExpired(super.get(key))) {
			super.delete(key);
			return false;
		}

		return true;
	}
}

module.exports = CacheConf;
