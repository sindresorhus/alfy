import {expectType} from 'tsd';
import alfy, {type ScriptFilterItem} from './index.js';

const mockItems: ScriptFilterItem[] = [
	{
		title: 'Unicorn',
	},
	{
		title: 'Rainbow',
	},
];

expectType<void>(alfy.output(mockItems));
expectType<void>(alfy.output(mockItems, {variables: {animal: 'unicorn'}}));

expectType<string[]>(alfy.matches('Corn', ['foo', 'unicorn']));

expectType<ScriptFilterItem[]>(alfy.matches('Unicorn', mockItems, 'title'));

expectType<string[]>(alfy.inputMatches(['foo', 'unicorn']));

expectType<ScriptFilterItem[]>(alfy.inputMatches(mockItems, 'title'));

expectType<void>(alfy.error(new Error('some error')));

expectType<void>(alfy.log('some message'));

expectType<Promise<unknown>>(alfy.fetch('https://foo.bar', {
	transform: body => body, // eslint-disable-line @typescript-eslint/no-unsafe-return
}));
