import process from 'node:process';
import { config as shared } from '../../utils.js';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	...shared,
	webServer: {
		...shared.webServer,
		command: process.env.DEV ? 'pnpm exec vite dev --port 4173' : shared.webServer.command,
		port: process.env.DEV ? 4173 : shared.webServer.port
	}
};

export default config;
