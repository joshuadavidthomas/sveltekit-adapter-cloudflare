import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('worker', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toContainText('Sum: 3');
});

test('ctx', async ({ request }) => {
	const res = await request.get('/ctx');
	expect(await res.text()).toBe('ctx works');
});

test('read from $app/server works', async ({ request }) => {
	const content = fs.readFileSync(path.resolve(__dirname, '../src/routes/read/file.txt'), 'utf-8');
	const response = await request.get('/read');
	expect(await response.text()).toBe(content);
});

test('build output wires Cloudflare handlers without publishing the base worker', async () => {
	test.skip(!!process.env.DEV, 'build output only exists in preview mode');

	const worker = fs.readFileSync(path.resolve(__dirname, '../dist/index.js'), 'utf-8');

	expect(worker).toContain('_worker.base.js');
	expect(worker).toContain('worker-handlers.js');
	expect(worker).not.toContain('handlers.cloudflare.js');
	expect(worker).toContain('handlers.scheduled');
	expect(worker).toContain('handlers.queue');
	expect(worker).toContain('handlers.email');
	expect(fs.existsSync(path.resolve(__dirname, '../dist/public/_worker.base.js'))).toBe(false);
	expect(
		fs.existsSync(path.resolve(__dirname, '../.svelte-kit/cloudflare-tmp/_worker.base.js'))
	).toBe(true);
});
