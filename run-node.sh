#!/bin/bash
eval $(/usr/libexec/path_helper -s)
eval "$($SHELL -i -l -c 'echo -e "\n"PATH=\"$PATH:\$PATH\""\n"' 2>/dev/null | grep "^PATH=")"
export PATH

if command -v node >/dev/null 2>&1; then
	node "$1" "$2"
else
	echo $'{"items":[{"title": "Couldn\'t find the `node` binary", "subtitle": "Symlink it to `/usr/local/bin`"}]}'
fi
