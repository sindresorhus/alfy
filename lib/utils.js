const isPlainObj = require('is-plain-obj');

const wrapArg = item => {
	const alfredworkflow = {arg: item.arg, variables: item.env};
	const arg = JSON.stringify({alfredworkflow});
	const newItem = Object.assign({}, item, {arg});
	delete newItem.env;
	return newItem;
};

const formatMods = item => {
	const copy = Object.assign({}, item);

	for (const mod of Object.keys(item.mods)) {
		copy.mods[mod] = wrapArg(item.mods[mod]);
	}

	return copy;
};

// See https://www.alfredforum.com/topic/9070-how-to-workflowenvironment-variables/ for documentation on setting environment variables from Alfred workflows.
module.exports.format = item => {
	if (!isPlainObj(item)) {
		throw new TypeError(`Expected \`item\` to be a plain object, got \`${typeof item}\`.`);
	}

	if (item.env) {
		item = wrapArg(item);
	}

	if (item.mods) {
		item = formatMods(item);
	}

	return item;
};
