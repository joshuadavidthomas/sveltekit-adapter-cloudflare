import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('worker', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toContainText('Sum: 3');
});

test('build output wires Cloudflare handlers without publishing the base worker', async () => {
	const worker = fs.readFileSync(
		path.resolve(__dirname, '../.svelte-kit/cloudflare/_worker.js'),
		'utf-8'
	);

	expect(worker).toContain('_worker.base.js');
	expect(worker).toContain('handlers.cloudflare.js');
	expect(fs.existsSync(path.resolve(__dirname, '../.svelte-kit/cloudflare/_worker.base.js'))).toBe(
		false
	);
	expect(
		fs.existsSync(path.resolve(__dirname, '../.svelte-kit/cloudflare-tmp/_worker.base.js'))
	).toBe(true);
});
