import { expectType } from 'tsd';
import alfy, { ScriptFilterItem } from './index';

const mockItems: ScriptFilterItem[] = [
	{
		title: 'Unicorn'
	},
	{
		title: 'Rainbow'
	}
];

expectType<void>(alfy.output(mockItems));

expectType<string[]>(alfy.matches('Corn', ['foo', 'unicorn']));

expectType<ScriptFilterItem[]>(alfy.matches('Unicorn', mockItems, 'title'));

expectType<string[]>(alfy.inputMatches(['foo', 'unicorn']));

expectType<ScriptFilterItem[]>(alfy.inputMatches(mockItems, 'title'));

expectType<void>(alfy.error(new Error('some error')));

expectType<void>(alfy.log('some message'));

expectType<Promise<any>>(alfy.fetch('https://api.foo.com', {
	transform: body => {
		body.foo = 'bar';
		return body;
	}
}));