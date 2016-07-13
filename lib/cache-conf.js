'use strict';
const Conf = require('conf');

class CacheConf extends Conf {

	get(key) {
		if (this.isExpired(key)) {
			super.delete(key);
			return;
		}

		const item = super.get(key);

		return item && item.data;
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

		if (this.isExpired(key)) {
			super.delete(key);
			return false;
		}

		return true;
	}

	isExpired(key) {
		const item = super.get(key);

		return item && item.timestamp && item.timestamp < Date.now();
	}
}

module.exports = CacheConf;
