# ![Alfy](https://cdn.rawgit.com/sindresorhus/alfy/8ba34c77a6a2ba20caaadbb9a3ccbf504459e0f7/media/header.svg)

> Create [Alfred workflows](https://www.alfredapp.com/workflows/) with ease

[![Build Status](https://travis-ci.org/sindresorhus/alfy.svg?branch=master)](https://travis-ci.org/sindresorhus/alfy)


## Highlights

- Easy input↔output.
- Config and cache handling built-in.
- [Finds the `node` binary.](run-node.sh)
- Presents uncaught exceptions and unhandled Promise rejections to the user.<br>
  *No need to manually `.catch()` top-level promises.*


## Prerequisites

You need [Node.js 4+](https://nodejs.org) and [Alfred 3](https://www.alfredapp.com) with the paid [Powerpack](https://www.alfredapp.com/powerpack/) upgrade.


## Install

```
$ npm install --save alfy
```


## Usage

Create a new Alfred workflow and add a Script Filter with the following script:

```sh
./node_modules/.bin/run-node index.js "$1"
```

*We can't call `node` directly as GUI apps on macOS doesn't inherit the $PATH.*

In the workflow directory, create a `index.js` file, import `alfy`, and do your thing.


## Example

Here we use [`got`](https://github.com/sindresorhus/got) to fetch some JSON from a placeholder API and present matching items to the user:

```js
const alfy = require('alfy');
const got = require('got');

got('jsonplaceholder.typicode.com/posts', {json: true}).then(result => {
	const items = result.body
		.filter(x => `${x.title} ${x.body}`.includes(alfy.input))
		.map(x => ({
			title: x.title,
			subtitle: x.body,
			arg: x.id
		}));

	alfy.output(items);
});
```

<img src="media/screenshot.png" width="694">


###### More

Some example usage in the wild: [`alfred-npms`](https://github.com/sindresorhus/alfred-npms), [`alfred-emoj`](https://github.com/sindresorhus/alfred-emoj), [`alfred-ng2`](https://github.com/SamVerschueren/alfred-ng2).


## API

### alfy

#### input

Type: `string`

Input from Alfred. What the user wrote in the input box.

#### output(list)

Return output to Alfred.

##### list

Type: `Array`

List of `Object` with any of the [supported properties](https://www.alfredapp.com/help/workflows/inputs/script-filter/json/).

Example:

```js
alfy.output([{
	title: 'Unicorn'
}, {
	title: 'Rainbow'
}]);
```

<img src="media/screenshot-output.png" width="694">

#### matches(input, list, [item])

Returns an `Array` of items in `list` that case-insensitively contains `input`.

```js
alfy.matches('Corn', ['foo', 'unicorn']);
//=> ['unicorn']
```

##### input

Type: `string`

Text to match against the `list` items.

##### list

Type: `Array`

List to be matched against.

##### item

Type: `string` `Function`

By default it will match against the `list` items.

Specify a string to match against an object property:

```js
const list = [{
	title: 'foo'
}, {
	title: 'unicorn'
}];

alfy.matches('Unicorn', list, 'title');
//=> [{title: 'unicorn'}]
```

Or [nested property](https://github.com/sindresorhus/dot-prop):

```js
const list = [{
	name: {
		first: 'John',
		last: 'Doe'
	}
}, {
	name: {
		first: 'Sindre',
		last: 'Sorhus'
	}
}];

alfy.matches('sindre', list, 'name.first');
//=> [{name: {first: 'Sindre', last: 'Sorhus'}}]
```

Specify a function to handle the matching yourself. The function receives the list item and input, both lowercased, as arguments, and is expected to return a boolean whether it matches:

```js
const list = ['foo', 'unicorn'];

// here we do an exact match
// `Foo` matches the item since it's lowercased for you
alfy.matches('Foo', list, (item, input) => item === input);
//=> ['foo']
```

#### matchesInput(list, [item])

Same as `matches()`, but with `alfy.input` as `input`.

#### log(text)

##### text

Type: `string`

Text to be logged to the debug panel. Only logs when `alfred.debug` is `true`, so not to interfere with the normal output.

#### error(err)

Display an error or error message in Alfred.

##### err

Type: `Error` `string`

Error or error message to be displayed.

<img src="media/screenshot-error.png" width="694">

#### config

Type: `Object`

Persist config data.

Exports a [`conf` instance](https://github.com/sindresorhus/conf#instance) with the correct config path set.

Example:

```js
alfy.config.set('unicorn', '🦄');

alfy.config.get('unicorn');
//=> '🦄'
```

#### cache

Type: `Object`

Persist cache data.

Exports a modified [`conf` instance](https://github.com/sindresorhus/conf#instance) with the correct cache path set.

Example:

```js
alfy.cache.set('unicorn', '🦄');

alfy.cache.get('unicorn');
//=> '🦄'
```

##### maxAge

The `set` method of this instance accepts an optional third argument where you can provide a `maxAge` option. `maxAge` is
the number of milliseconds the value is valid in the cache.

Example:

```js
const delay = require('delay');

alfy.cache.set('foo', 'bar', {maxAge: 5000});

alfy.cache.get('foo');
//=> 'bar'

// Wait 5 seconds
await delay(5000);

alfy.cache.get('foo');
//=> undefined
```

#### debug

Type: `boolean`

Whether the user currently has the [workflow debugger](https://www.alfredapp.com/help/workflows/advanced/debugger/) open.

#### icon

Type: `Object`<br>
Keys: `info` `warning` `error` `alert` `like` `delete`

Get various default system icons.

The most useful ones are included as keys. The rest you can get with `icon.get()`. Go to `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources` in Finder to see them all.

Example:

```js
console.log(alfy.icon.error);
//=> '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'

console.log(alfy.icon.get('Clock'));
//=> '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/Clock.icns'
```

#### meta

Type: `Object`

Example:

```js
{
	name: 'Emoj',
	version: '0.2.5',
	uid: 'user.workflow.B0AC54EC-601C-479A-9428-01F9FD732959',
	bundleId: 'com.sindresorhus.emoj'
}
```

#### alfred

Type: `Object`

Alfred metadata.

##### version

Example: `'3.0.2'`

Find out which version the user is currently running. This may be useful if your workflow depends on a particular Alfred version's features.

##### theme

Example: `'alfred.theme.yosemite'`

Current theme used.

##### themeBackground

Example: `'rgba(255,255,255,0.98)'`

If you're creating icons on the fly, this allows you to find out the color of the theme background.

##### themeSelectionBackground

Example: `'rgba(255,255,255,0.98)'`

The color of the selected result.

##### themeSubtext

Example: `3`

Find out what subtext mode the user has selected in the Appearance preferences.

> Usability note: This is available so developers can tweak the result text based on the user's selected mode, but a workflow's result text should not be bloated unnecessarily based on this, as the main reason users generally hide the subtext is to make Alfred look cleaner.

##### data

Example: `'/Users/sindresorhus/Library/Application Support/Alfred 3/Workflow Data/com.sindresorhus.npms'`

Recommended location for non-volatile data. Just use `alfy.data` which uses this path.

##### cache

Example: `'/Users/sindresorhus/Library/Caches/com.runningwithcrayons.Alfred-3/Workflow Data/com.sindresorhus.npms'`

Recommended location for volatile data. Just use `alfy.cache` which uses this path.

##### preferences

Example: `'/Users/sindresorhus/Dropbox/Alfred/Alfred.alfredpreferences'`

This is the location of the `Alfred.alfredpreferences`. If a user has synced their settings, this will allow you to find out where their settings are regardless of sync state.

##### preferencesLocalHash

Example: `'adbd4f66bc3ae8493832af61a41ee609b20d8705'`

Non-synced local preferences are stored within `Alfred.alfredpreferences` under `…/preferences/local/${preferencesLocalHash}/`.


## Users

*Alfred workflows using Alfy*

- [alfred-emoj](https://github.com/sindresorhus/alfred-emoj) - Find relevant emoji from text
- [alfred-npms](https://github.com/sindresorhus/alfred-npms) - Search for npm packages with npms.io
- [alfred-ng2](https://github.com/SamVerschueren/alfred-ng2) - Search for Angular 2 API references
- [alfred-react-native](https://github.com/ekonstantinidis/alfred-react-native) - Access the React Native documentation


## Related

- [alfred-simple](https://github.com/sindresorhus/alfred-simple) - Simple theme for Alfred *(Used in the screenshots)*


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
