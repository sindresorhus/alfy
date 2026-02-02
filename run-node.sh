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

	# Use delimiters to reliably extract PATH from shell startup noise (inspired by `shell-env`).
	# Disable Oh My Zsh plugins that can block the process.
	local delimiter="_ALFY_ENV_DELIMITER_"
	local raw_env
	raw_env="$(DISABLE_AUTO_UPDATE=true ZSH_TMUX_AUTOSTARTED=true ZSH_TMUX_AUTOSTART=false $SHELL -ilc "echo -n $delimiter; command env; echo -n $delimiter; exit" 2>/dev/null)"

	# Extract the env output between the delimiters.
	local env_output="${raw_env#*"$delimiter"}"
	env_output="${env_output%%"$delimiter"*}"

	# Extract PATH from the env output.
	local user_path
	user_path="$(echo "$env_output" | sed -n 's/^PATH=//p')"

	# Only write cache if we got a non-empty result.
	if [[ -n "$user_path" ]]; then
		echo "PATH=\"${user_path}:\$PATH\"" > "$PATH_CACHE"
	fi
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
	node "$@"
else
	echo $'{"items":[{"title": "Couldn\'t find the `node` binary", "subtitle": "Symlink it to `/usr/local/bin`"}]}'
fi
