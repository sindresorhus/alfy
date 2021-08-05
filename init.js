#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import execa from 'execa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
	try {
		await execa('alfred-link', {
			preferLocal: true,
			localDir: __dirname,
		});

		await execa('alfred-config', {
			preferLocal: true,
			localDir: __dirname,
			stdio: 'inherit',
		});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
})();

