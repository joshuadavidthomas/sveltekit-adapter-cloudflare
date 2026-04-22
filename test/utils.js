import { devices } from '@playwright/test';
import process from 'node:process';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export const config = {
	forbidOnly: !!process.env.CI,
	// generous timeouts on CI
	timeout: process.env.CI ? 45000 : 15000,
	webServer: {
		command: process.env.DEV ? 'pnpm dev' : 'pnpm build && pnpm preview',
		port: process.env.DEV ? 5173 : 8787
	},
	retries: process.env.CI ? 2 : number_from_env('KIT_E2E_RETRIES', 0),
	projects: [
		{
			name: 'chromium'
		}
	],
	use: {
		...devices['Desktop Chrome'],
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
		channel: 'chromium'
	},
	workers: process.env.CI ? 2 : number_from_env('KIT_E2E_WORKERS', undefined),
	reporter: 'list',
	testDir: 'test',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

/**
 * read process.env[name] and convert to number
 *
 * @param {string} name of process.env value to read
 * @param {number|undefined} default_value
 * @return {number|undefined} number or default_value if process.env[name] isn't set
 * @throws {Error} when value cannot be parsed to number
 */
function number_from_env(name, default_value) {
	const val = process.env[name];
	if (val != null) {
		const num = Number(val);
		if (Number.isNaN(num)) {
			throw new Error(`process.env.${name} must be parsable to a number but is "${val}"`);
		}
		return num;
	}
	return default_value;
}
