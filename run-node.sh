#!/bin/bash

if [[ -z "$alfred_workflow_cache" ]]; then
	echo "This script must be called from Alfred, \$alfred_workflow_cache is missing. Make sure a Bundle ID is set."
	exit 1
fi

if [[ ! -d "$alfred_workflow_cache" ]]; then
	mkdir -p "$alfred_workflow_cache"
fi

PATH_CACHE="$alfred_workflow_cache"/node_path

get_user_path() {
	eval $(/usr/libexec/path_helper -s)
	echo "$($SHELL -i -l -c 'echo -e "\n"PATH=\"$PATH:\$PATH\""\n"' 2>/dev/null | grep "^PATH=")" > "$PATH_CACHE"
}

set_path() {
	if [[ -f "$PATH_CACHE" ]]; then
		. "$PATH_CACHE"
	else
		get_user_path
		. "$PATH_CACHE"
	fi

	export PATH
}

has_node() {
	command -v node >/dev/null 2>&1
}

# Check if we have Node.js, otherwise inherit path from user shell
if ! has_node; then
	set_path

	# Retry by deleting old path cache
	if ! has_node; then
		rm "$PATH_CACHE"
		set_path
	fi
fi

if has_node; then
	ESM_OPTIONS='{"await":true}' node --require esm "$@"
else
	echo $'{"items":[{"title": "Couldn\'t find the `node` binary", "subtitle": "Symlink it to `/usr/local/bin`"}]}'
fi
