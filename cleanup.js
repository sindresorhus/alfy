#!/usr/bin/env node
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import execa from 'execa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
	try {
		await execa('alfred-unlink', {
			preferLocal: true,
			localDir: __dirname,
		});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
})();
