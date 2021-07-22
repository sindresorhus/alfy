import Conf from 'conf';
import { GotOptions, GotUrl } from 'got';

interface FetchOptions extends GotOptions<string> {
	/**
	@type {boolean}
	@default true
	@description Parse response body with JSON.parse and set accept header to application/json.
	*/
	json?: boolean;

	/**
	@type {number}
	@description Number of milliseconds this request should be cached.
	*/
	maxAge?: number;

	/**
	@type {(body: unknown) => unknown}
	@description Transform the response before it gets cached.
	*/
	transform?: (body: unknown) => unknown;
}

interface OutputOptions {
	rerunInterval?: number;
}

interface CacheConfGetOptions {
	ignoreMaxAge?: boolean;
}

interface CacheConfSetOptions {
	maxAge?: number;
}

interface CacheConf<T> extends Conf<T> {
	get<Key extends keyof T>(key: Key, options: CacheConfGetOptions): T[Key];
	get<Key extends keyof T>(key: Key, defaultValue: Required<T>[Key], options: CacheConfGetOptions): Required<T>[Key];
	get<Key extends string, Value = unknown>(key: Exclude<Key, keyof T>, defaultValue?: Value, options: CacheConfGetOptions): Value;
	get(key: string, defaultValue?: unknown, options: CacheConfGetOptions): unknown;

	set<Key extends keyof T>(key: Key, value?: T[Key], options: CacheConfSetOptions): void;
	set(key: string, value: unknown, options: CacheConfSetOptions): void;
	set(object: Partial<T>, options: CacheConfSetOptions): void;
	set<Key extends keyof T>(key: Partial<T> | Key | string, value?: T[Key] | unknown, options: CacheConfSetOptions): void

	isExpired: (key: T) => boolean;
}

interface IconElement {
	readonly path?: string;
	readonly type?: 'fileicon' | 'filetype'
}

interface TextElement {
	readonly copy?: string;
	readonly largetype?: string;
}

interface ModifierKeyItem {
	readonly valid?: boolean;
	readonly title?: string;
	readonly subtitle?: string;
	readonly arg?: string;
	readonly icon?: string;
	readonly variables?: Record<string, string>;
}

type PossibleModifiers = "fn" | "ctrl" | "opt" | "cmd" | "shift";

/**
	@interface ScriptFilterItem
	@description Each item describes a result row displayed in Alfred.
*/
interface ScriptFilterItem {
	/**
	@description This is a unique identifier for the item which allows help Alfred to learn about this item for subsequent sorting and ordering of the user's actioned results.
	It is important that you use the same UID throughout subsequent executions of your script to take advantage of Alfred's knowledge and sorting.
	If you would like Alfred to always show the results in the order you return them from your script, exclude the UID field. 
	*/
	readonly uid?: string;
	
	/**
	@description The title displayed in the result row. There are no options for this element and it is essential that this element is populated.
	@example
	```
	"title": "Desktop"
	```
	*/
	readonly title: string;
	
	/**
	@description The subtitle displayed in the result row. This element is optional.
	@example
	```
	"subtitle": "~/Desktop"
	```
	*/
	readonly subtitle?: string;

	/**
	@description The argument which is passed through the workflow to the connected output action.
	While the arg attribute is optional, it's highly recommended that you populate this as it's the string which is passed to your connected output actions.
	If excluded, you won't know which result item the user has selected.
	@example
	```
	"arg": "~/Desktop"
	```
	*/
	readonly arg?: string;

	/**
	@description The icon displayed in the result row. Workflows are run from their workflow folder, so you can reference icons stored in your workflow relatively.
	By omitting the "type", Alfred will load the file path itself, for example a png.
	By using "type": "fileicon", Alfred will get the icon for the specified path. Finally, by using "type": "filetype", you can get the icon of a specific file, for example "path": "public.png"
	@example
	```
	"icon": {
		"type": "fileicon",
		"path": "~/Desktop"
	}
	```
	*/
	readonly icon?: IconElement | string;

	/**
	@description If this item is valid or not. If an item is valid then Alfred will action this item when the user presses return. 
	@default true
	*/
	readonly valid?: boolean;

	/**
	@description From Alfred 3.5, the match field enables you to define what Alfred matches against when the workflow is set to "Alfred Filters Results". If match is present, it fully replaces matching on the title property.
	*/
	readonly match?: string;

	/**
	@description An optional but recommended string you can provide which is populated into Alfred's search field if the user auto-complete's the selected result (⇥ by default).
	*/
	readonly autocomplete?: string;

	/**
	@description By specifying "type": "file", this makes Alfred treat your result as a file on your system. This allows the user to perform actions on the file like they can with Alfred's standard file filters.
	When returning files, Alfred will check if the file exists before presenting that result to the user.
	This has a very small performance implication but makes the results as predictable as possible.
	If you would like Alfred to skip this check as you are certain that the files you are returning exist, you can use "type": "file:skipcheck".
	@default "default"
	*/
	readonly type?: "default" | "file" | "file:skipcheck";

	/**
	@description The mod element gives you control over how the modifier keys react.
	You can now define the valid attribute to mark if the result is valid based on the modifier selection and set a different arg to be passed out if actioned with the modifier.
	*/
	readonly mods?: Record<PossibleModifiers, ModifierKeyItem>;

	/**
	@description The text element defines the text the user will get when copying the selected result row with ⌘C or displaying large type with ⌘L.
	@example
	```
	"text": {
		"copy": "https://www.alfredapp.com/ (text here to copy)",
		"largetype": "https://www.alfredapp.com/ (text here for large type)"
	}
	```
	*/
	readonly text?: TextElement;

	/**
	@description A Quick Look URL which will be visible if the user uses the Quick Look feature within Alfred (tapping shift, or ⌘Y). 
	Note that quicklookurl will also accept a file path, both absolute and relative to home using ~/.
	@example
	```
	"quicklookurl": "https://www.alfredapp.com/"
	```
	*/
	readonly quicklookurl?: string;

	readonly variables?: Record<string, string>;
}

export default interface Alfy {
	/**
	@param {Record<string, ScriptFilterItem>} items
	@param {OutputOptions} options
	@returns {void}
	@description Return output to Alfred.
	@example
	```
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
	output: (items: Record<string, ScriptFilterItem>, options?: OutputOptions) => void;

	/**
	@param {string} input
	@param {(string | Record<string, unknown>)[]} list
	@param {string|((item: string | Record<string, unknown>, input: string) => boolean)} item
	@returns {string[]}
	@description Returns an string[] of items in list that case-insensitively contains input.
	@example
	```
	alfy.matches('Corn', ['foo', 'unicorn']);
	//=> ['unicorn']
	```
	*/
	matches: (input: string, list: (string | Record<string, unknown>)[], item?: string | ((item: string | Record<string, unknown>, input: string) => boolean)) => string[];

	/**
	@param {string[]} list
	@param {string|((item: string | Record<string, unknown>, input: string) => boolean)} item
	@returns {string[]}
	@description Same as matches(), but with alfy.input as input
	*/
	inputMatches: (list: string[], item?: string | ((item: string | Record<string, unknown>, input: string) => boolean)) => string[];

	/**
	@param {string} text
	@returns {void}
	@description Log value to the Alfred workflow debugger.
	*/
	log: (text: string) => void;

	/**
	@param {Error | string} error
	@returns {void}
	@description Display an error or error message in Alfred.
	You don't need to .catch() top-level promises.
	Alfy handles that for you.
	*/
	error: (error: Error | string) => void;

	/**
	@param {GotUrl} url
	@param {FetchOptions} options?
	@returns {Promise<unknown>}
	@description Returns a Promise that returns the body of the response.
	@example
	```
	await alfy.fetch('https://api.foo.com', {
		transform: body => {
			body.foo = 'bar';
			return body;
		}
	})
	```
	*/
	fetch: (url: GotUrl, options?: FetchOptions) => Promise<unknown>;

	/**
	@description
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
	@description Input from Alfred. What the user wrote in the input box.
	*/
	input: string;

	/**
	@description Persist config data.
	Exports a conf instance with the correct config path set.
	@example
	```
	alfy.config.set('unicorn', '🦄');

	alfy.config.get('unicorn');
	//=> '🦄'
	```
	*/
	config: Conf<unknown>;

	/**
	@description Persist cache data.
	Exports a modified conf instance with the correct cache path set.
	@example
	```
	alfy.cache.set('unicorn', '🦄');

	alfy.cache.get('unicorn');
	//=> '🦄'
	```
	*/
	cache: CacheConf<unknown>;

	/**
	@description Get various default system icons.
	The most useful ones are included as keys. The rest you can get with icon.get().
	Go to /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources in Finder to see them all.
	@example
	```
	console.log(alfy.icon.error);
	//=> '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'

	console.log(alfy.icon.get('Clock'));
	//=> '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/Clock.icns'
	```
	*/
	icon: {
		get: (icon: string) => string;
		info: string;
		warning: string;
		error: string;
		alert: string;
		like: string;
		delete: string;
	};

	/**
	@description Alfred metadata.
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
	@description Whether the user currently has the workflow debugger open.
	*/
	debug: boolean

	/**
	@description Exports a Map with the user workflow configuration.
	A workflow configuration allows your users to provide configuration information for the workflow. 
	For instance, if you are developing a GitHub workflow, you could let your users provide their own API tokens.
	See alfred-config for more details.
	@example
	```
	alfy.userConfig.get('apiKey');
	//=> '16811cad1b8547478b3e53eae2e0f083'
	```
	*/
	userConfig: Map<string, string>;
};