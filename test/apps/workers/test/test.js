import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('worker', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toContainText('Sum: 3');
});

test('cloudflare:workers', async ({ request }) => {
	const res = await request.get('/env');
	expect(await res.text()).toBe('from wrangler.jsonc');
});

test('Request.cf', async ({ request }) => {
	const res = await request.get('/cf');
	const cf = await res.json();
	expect(cf.colo).toBeDefined();
});

test('read from $app/server works', async ({ request }) => {
	const content = fs.readFileSync(
		path.resolve(import.meta.dirname, '../src/routes/read/file.txt'),
		'utf-8'
	);
	const response = await request.get('/read');
	expect(await response.text()).toBe(content);
});

test('prerendering throws', async ({ request }) => {
	test.skip(!!process.env.DEV);
	const res = await request.get('/prerender');
	expect(await res.text()).toContain('Cannot access cloudflare:workers in a prerenderable route');
});

test('Durable Object from the platform file', async ({ request }) => {
	test.skip(!!process.env.DEV, 'platform exports are only wired in the build output');
	const res = await request.get('/durable-object');
	expect(await res.text()).toBe('Hello, SvelteKit from a Durable Object');
});

test('scheduled handler from the platform file', async ({ request }) => {
	test.skip(!!process.env.DEV, 'platform exports are only wired in the build output');
	// wrangler responds with 200 even when the worker has no `scheduled` handler,
	// so check that the handler ran by having it record a unique cron value
	const cron = `test-${Date.now()}`;
	const res = await request.get(`/__scheduled?cron=${cron}`);
	expect(res.status()).toBe(200);
	const recorded = await request.get('/durable-object?scheduled');
	expect(await recorded.text()).toBe(cron);
});

test('build output wires Cloudflare handlers without publishing the base worker', async () => {
	test.skip(!!process.env.DEV, 'build output only exists in preview mode');

	const dir = import.meta.dirname;
	const worker = fs.readFileSync(path.resolve(dir, '../dist/index.js'), 'utf-8');

	expect(worker).toContain('_worker.base.js');
	expect(worker).toContain('custom-platform.js');
	expect(worker).not.toContain('platform.cloudflare.js');
	expect(worker).toContain('export * from');
	expect(worker).not.toContain('import * as platform');
	expect(worker).toContain('platform.scheduled');
	expect(worker).toContain('platform.queue');
	expect(worker).toContain('platform.email');
	expect(worker).toContain('platform.tail');
	expect(fs.existsSync(path.resolve(dir, '../dist/public/_worker.base.js'))).toBe(false);
	expect(fs.existsSync(path.resolve(dir, '../.svelte-kit/cloudflare-tmp/_worker.base.js'))).toBe(
		true
	);
});
