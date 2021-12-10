import Conf from 'conf';
import {Options} from 'got';

export interface FetchOptions extends Options {
	/**
	URL search parameters.
	*/
	readonly query?: string | Record<string, string | number | boolean | null | undefined> | URLSearchParams | undefined;

	/**
	Number of milliseconds this request should be cached.
	*/
	readonly maxAge?: number;

	/**
	Transform the response before it gets cached.
	*/
	readonly transform?: (body: unknown) => unknown;
}

export interface OutputOptions {
	/**
	A script can be set to re-run automatically after some interval.

	The script will only be re-run if the script filter is still active and the user hasn't changed the state of the filter by typing and triggering a re-run. For example, it could be used to update the progress of a particular task:
	*/
	readonly rerunInterval?: number;
}

export interface CacheConfGetOptions {
	/**
	Get the item for the key provided without taking the `maxAge` of the item into account.
	*/
	readonly ignoreMaxAge?: boolean;
}

export interface CacheConfSetOptions {
	/**
	Number of milliseconds the cached value is valid.
	*/
	readonly maxAge?: number;
}

export interface CacheConf<T> extends Conf<T> {
	isExpired: (key: T) => boolean;

	get<Key extends keyof T>(key: Key, options?: CacheConfGetOptions): T[Key];
	get<Key extends keyof T>(key: Key, defaultValue: Required<T>[Key], options?: CacheConfGetOptions): Required<T>[Key];
	get<Key extends string, Value = unknown>(key: Exclude<Key, keyof T>, defaultValue?: Value, options?: CacheConfGetOptions): Value;
	get(key: string, defaultValue?: unknown, options?: CacheConfGetOptions): unknown;

	set<Key extends keyof T>(key: Key, value?: T[Key], options?: CacheConfSetOptions): void;
	set(key: string, value: unknown, options: CacheConfSetOptions): void;
	set(object: Partial<T>, options: CacheConfSetOptions): void;
	set<Key extends keyof T>(key: Partial<T> | Key | string, value?: T[Key] | unknown, options?: CacheConfSetOptions): void;
}

/**
The icon displayed in the result row. Workflows are run from their workflow folder, so you can reference icons stored in your workflow relatively.

By omitting the `.type`, Alfred will load the file path itself, for example a PNG.

By using `{type: 'fileicon}`, Alfred will get the icon for the specified path.

Finally, by using `{type: 'filetype'}`, you can get the icon of a specific file. For example, `{path: 'public.png'}`.
*/
export interface IconElement {
	readonly path?: string;
	readonly type?: 'fileicon' | 'filetype';
}

/**
The text element defines the text the user will get when copying the selected result row with `⌘C` or displaying large type with `⌘L`.

If these are not defined, you will inherit Alfred's standard behaviour where the argument is copied to the Clipboard or used for Large Type.
*/
export interface TextElement {
	/**
	User will get when copying the selected result row with `⌘C`.
	*/
	readonly copy?: string;

	/**
	User will get displaying large type with `⌘L`.
	*/
	readonly largetype?: string;
}

/**
Defines what to change when the modifier key is pressed.

When you release the modifier key, it returns to the original item.
*/
export interface ModifierKeyItem {
	readonly valid?: boolean;
	readonly title?: string;
	readonly subtitle?: string;
	readonly arg?: string;
	readonly icon?: string;
	readonly variables?: Record<string, string>;
}

/**
This element defines the Universal Action items used when actioning the result, and overrides arg being used for actioning.

The action key can take a string or array for simple types, and the content type will automatically be derived by Alfred to file, URL or text.
*/
export interface ActionElement {
	/**
	Forward text to Alfred.
	*/
	readonly text?: string | string[];

	/**
	Forward URL to Alfred.
	*/
	readonly url?: string | string[];

	/**
	Forward file path to Alfred.
	*/
	readonly file?: string | string[];

	/**
	Forward some value and let the value type be infered from Alfred.
	*/
	readonly auto?: string | string[];
}

type PossibleModifiers = 'fn' | 'ctrl' | 'opt' | 'cmd' | 'shift';

/**
Each item describes a result row displayed in Alfred.
*/
export interface ScriptFilterItem {
	/**
	This is a unique identifier for the item which allows help Alfred to learn about this item for subsequent sorting and ordering of the user's actioned results.

	It is important that you use the same UID throughout subsequent executions of your script to take advantage of Alfred's knowledge and sorting.

	If you would like Alfred to always show the results in the order you return them from your script, exclude the UID field.
	*/
	readonly uid?: string;

	/**
	The title displayed in the result row. There are no options for this element and it is essential that this element is populated.

	@example
	```
	{title: 'Desktop'}
	```
	*/
	readonly title: string;

	/**
	The subtitle displayed in the result row. This element is optional.

	@example
	```
	{subtitle: '~/Desktop'}
	```
	*/
	readonly subtitle?: string;

	/**
	The argument which is passed through the workflow to the connected output action.

	While the `arg` attribute is optional, it's highly recommended that you populate this as it's the string which is passed to your connected output actions.

	If excluded, you won't know which result item the user has selected.

	@example
	```
	{arg: '~/Desktop'}
	```
	*/
	readonly arg?: string;

	/**
	The icon displayed in the result row. Workflows are run from their workflow folder, so you can reference icons stored in your workflow relatively.

	By omitting the `.type`, Alfred will load the file path itself, for example a png.

	By using `{type: 'fileicon'}`, Alfred will get the icon for the specified path. Finally, by using `{type: 'filetype'}`, you can get the icon of a specific file. For example, `{path: 'public.png'}`.

	@example
	```
	{
		icon: {
			type: 'fileicon',
			path: '~/Desktop'
		}
	}
	```
	*/
	readonly icon?: IconElement | string;

	/**
	If this item is valid or not. If an item is valid then Alfred will action this item when the user presses return.

	@default true
	*/
	readonly valid?: boolean;

	/**
	From Alfred 3.5, the match field enables you to define what Alfred matches against when the workflow is set to 'Alfred Filters Results'.

	If match is present, it fully replaces matching on the title property.
	*/
	readonly match?: string;

	/**
	An optional but recommended string you can provide which is populated into Alfred's search field if the user auto-complete's the selected result (`⇥` by default).
	*/
	readonly autocomplete?: string;

	/**
	By specifying `{type: 'file'}`, it makes Alfred treat your result as a file on your system. This allows the user to perform actions on the file like they can with Alfred's standard file filters.

	When returning files, Alfred will check if the file exists before presenting that result to the user.

	This has a very small performance implication but makes the results as predictable as possible.

	If you would like Alfred to skip this check as you are certain that the files you are returning exist, you can use `{type: 'file:skipcheck'}`.

	@default 'default'
	*/
	readonly type?: 'default' | 'file' | 'file:skipcheck';

	/**
	Gives you control over how the modifier keys react.

	You can now define the valid attribute to mark if the result is valid based on the modifier selection and set a different arg to be passed out if actioned with the modifier.
	*/
	readonly mods?: Partial<Record<PossibleModifiers, ModifierKeyItem>>;

	/**
	This element defines the Universal Action items used when actioning the result, and overrides arg being used for actioning.

	The action key can take a string or array for simple types, and the content type will automatically be derived by Alfred to file, url or text.

	@example
	```
	{
		// For Single Item,
		action: 'Alfred is Great'

		// For Multiple Items,
		action: ['Alfred is Great', 'I use him all day long']

		// For control over the content type of the action, you can use an object with typed keys as follows:
		action: {
			text: ['one', 'two', 'three'],
			url: 'https://alfredapp.com',
			file: '~/Desktop',
			auto: '~/Pictures'
		}
	}
	```
	*/
	// TODO (jopemachine): Activate attribute below after 'action' is implemented in Alfred.
	// readonly action?: string | string[] | ActionElement;

	/**
	The text element defines the text the user will get when copying the selected result row with `⌘C` or displaying large type with `⌘L`.

	@example
	```
	{
		text: {
			copy: 'https://alfredapp.com (text here to copy)',
			largetype: 'https://alfredapp.com (text here for large type)'
		}
	}
	```
	*/
	readonly text?: TextElement;

	/**
	A Quick Look URL which will be visible if the user uses the Quick Look feature within Alfred (tapping shift, or `⌘Y`).

	Note that it can also accept a file path, both absolute and relative to home using `~/`.

	@example
	```
	{
		quicklookurl: 'https://alfredapp.com'
	}
	```
	*/
	readonly quicklookurl?: string;

	/**
	Variables can be passed out of the script filter within a variables object.
	*/
	readonly variables?: Record<string, string>;
}

/**
Create Alfred workflows with ease

@example
```
import alfy from 'alfy';

const data = await alfy.fetch('https://jsonplaceholder.typicode.com/posts');

const items = alfy
	.inputMatches(data, 'title')
	.map(element => ({
		title: element.title,
		subtitle: element.body,
		arg: element.id
	}));

alfy.output(items);
```
*/
export interface Alfy {
	/**
	Return output to Alfred.

	@example
	```
	import alfy from 'alfy';

	alfy.output([
		{
			title: 'Unicorn'
		},
		{
			title: 'Rainbow'
		}
	]);
	```
	*/
	output: (items: ScriptFilterItem[], options?: OutputOptions) => void;

	/**
	Returns items in list that case-insensitively contains input.

	@example
	```
	import alfy from 'alfy';

	alfy.matches('Corn', ['foo', 'unicorn']);
	//=> ['unicorn']
	```
	*/
	matches: <T extends string[] | ScriptFilterItem[]> (input: string, list: T, target?: string | ((item: string | ScriptFilterItem, input: string) => boolean)) => T;

	/**
	Same as `matches()`, but with `alfy.input` as input.

	@returns Items in list that case-insensitively contains `alfy.input`.

	@example
	```
	import alfy from 'alfy';

	// Assume user types 'Corn'.

	alfy.inputMatches(['foo', 'unicorn']);
	//=> ['unicorn']
	*/
	inputMatches: <T extends string[] | ScriptFilterItem[]> (list: T, target?: string | ((item: string | ScriptFilterItem, input: string) => boolean)) => T;

	/**
	Log value to the Alfred workflow debugger.

	@param text
	*/
	log: (text: string) => void;

	/**
	Display an error or error message in Alfred.

	**Note:** You don't need to `.catch()` top-level promises. Alfy handles that for you.

	@param error
	*/
	error: (error: Error | string) => void;

	/**
	Fetch remote data.

	@returns Body of the response.

	@example
	```
	import alfy from 'alfy';

	await alfy.fetch('https://api.foo.com', {
		transform: body => {
			body.foo = 'bar';
			return body;
		}
	})
	```
	*/
	fetch: (url: string, options?: FetchOptions) => Promise<unknown>;

	/**
	@example
	```
	{
		name: 'Emoj',
		version: '0.2.5',
		uid: 'user.workflow.B0AC54EC-601C-479A-9428-01F9FD732959',
		bundleId: 'com.sindresorhus.emoj'
	}
	```
	*/
	meta: {
		name: string;
		version: string;
		bundleId: string;
		type: string;
	};

	/**
	Input from Alfred. What the user wrote in the input box.
	*/
	input: string;

	/**
	Persist config data.

	Exports a [`conf` instance](https://github.com/sindresorhus/conf#instance) with the correct config path set.

	@example
	```
	import alfy from 'alfy';

	alfy.config.set('unicorn', '🦄');

	alfy.config.get('unicorn');
	//=> '🦄'
	```
	*/
	config: Conf<Record<string, unknown>>;

	/**
	Persist cache data.

	Exports a modified [`conf` instance](https://github.com/sindresorhus/conf#instance) with the correct cache path set.

	@example
	```
	import alfy from 'alfy';

	alfy.cache.set('unicorn', '🦄');

	alfy.cache.get('unicorn');
	//=> '🦄'
	```
	*/
	cache: CacheConf<unknown>;

	/**
	Get various default system icons.

	The most useful ones are included as keys. The rest you can get with `icon.get()`. Go to `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources` in Finder to see them all.

	@example
	```
	import alfy from 'alfy';

	console.log(alfy.icon.error);
	//=> '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'

	console.log(alfy.icon.get('Clock'));
	//=> '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/Clock.icns'
	```
	*/
	icon: {
		/**
		Get various default system icons.

		You can get icons in `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources`.
		*/
		get: (icon: string) => string;

		/**
		Get info icon which is `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ToolbarInfo`.
		*/
		info: string;

		/**
		Get warning icon which is `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertCautionIcon`.
		*/
		warning: string;

		/**
		Get error icon which is `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon`.
		*/
		error: string;

		/**
		Get alert icon which is `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/Actions`.
		*/
		alert: string;

		/**
		Get like icon which is `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ToolbarFavoritesIcon`.
		*/
		like: string;

		/**
		Get delete icon which is `/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/ToolbarDeleteIcon`.
		*/
		delete: string;
	};

	/**
	Alfred metadata.
	*/
	alfred: {
		version: string;
		theme: string;
		themeBackground: string;
		themeSelectionBackground: string;
		themeSubtext: string;
		data: string;
		cache: string;
		preferences: string;
		preferencesLocalHash: string;
	};

	/**
	Whether the user currently has the workflow debugger open.
	*/
	debug: boolean;

	/**
	Exports a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) with the user workflow configuration. A workflow configuration allows your users to provide
	configuration information for the workflow. For instance, if you are developing a GitHub workflow, you could let your users provide their own API tokens.

	See [`alfred-config`](https://github.com/SamVerschueren/alfred-config#workflow-configuration) for more details.

	@example
	```
	import alfy from 'alfy';

	alfy.userConfig.get('apiKey');
	//=> '16811cad1b8547478b3e53eae2e0f083'
	```
	*/
	userConfig: Map<string, string>;
}

declare const alfy: Alfy;

export default alfy;
