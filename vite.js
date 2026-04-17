import { existsSync } from 'node:fs';
import { getPlatformProxy } from 'wrangler';

const USER_HANDLER_CANDIDATES = [
	'src/hooks.cloudflare.js',
	'src/hooks.cloudflare.ts',
	'src/hooks.cloudflare.mjs'
];

/**
 * Dev-only Vite plugin that exposes trigger routes for the Cloudflare
 * non-fetch handlers declared in `src/hooks.cloudflare.{js,ts,mjs}`:
 *
 *   POST /__scheduled?cron=<pattern>  → invokes `scheduled`
 *   POST /__queue                     → body is { queue, messages: [{ id?, body, ... }] }
 *   POST /__email                     → body is the raw message source
 *
 * The handlers receive the same `env`/`ctx`/`caches`/`cf` that `getPlatformProxy`
 * already provides to the fetch handler during dev.
 *
 * @param {{
 *   platformProxy?: import('wrangler').GetPlatformProxyOptions,
 *   entry?: string
 * }} [options]
 * @returns {import('vite').Plugin}
 */
export function cloudflareDevHandlers(options = {}) {
	const entry = options.entry ?? USER_HANDLER_CANDIDATES.find((c) => existsSync(c));

	return {
		name: 'vite-plugin-adapter-cloudflare-dev-handlers',
		apply: 'serve',
		async configureServer(server) {
			if (!entry || !existsSync(entry)) return;

			const proxy = await getPlatformProxy(options.platformProxy);

			/** @type {() => Promise<Record<string, any>>} */
			const load = () => server.ssrLoadModule(/** @type {string} */ (entry));

			const run = async (
				/** @type {import('http').IncomingMessage} */ req,
				/** @type {import('http').ServerResponse} */ res,
				/** @type {string} */ handler_name,
				/** @type {(mod: Record<string, any>, body: string) => Promise<any>} */ invoke
			) => {
				try {
					const mod = await load();
					if (typeof mod[handler_name] !== 'function') {
						res.statusCode = 404;
						res.end(`No \`${handler_name}\` export found in ${entry}`);
						return;
					}
					const body = await read_body(req);
					await invoke(mod, body);
					res.statusCode = 202;
					res.end('ok');
				} catch (err) {
					res.statusCode = 500;
					res.end(/** @type {Error} */ (err).stack ?? String(err));
				}
			};

			server.middlewares.use('/__scheduled', async (req, res) => {
				if (req.method !== 'POST' && req.method !== 'GET') return res.end();
				const url = new URL(req.url ?? '/', 'http://localhost');
				const controller = {
					scheduledTime: Date.now(),
					cron: url.searchParams.get('cron') ?? '* * * * *',
					noRetry() {}
				};
				await run(req, res, 'scheduled', (mod) => mod.scheduled(controller, proxy.env, proxy.ctx));
			});

			server.middlewares.use('/__queue', async (req, res) => {
				if (req.method !== 'POST') return res.end();
				await run(req, res, 'queue', (mod, body) => {
					const parsed = body ? JSON.parse(body) : {};
					const messages = (parsed.messages ?? []).map(
						/** @param {{ id?: string, body: unknown, timestamp?: string, attempts?: number }} m */
						(m, i) => ({
							id: m.id ?? `dev-${i}`,
							timestamp: new Date(m.timestamp ?? Date.now()),
							attempts: m.attempts ?? 1,
							body: m.body,
							ack() {},
							retry() {}
						})
					);
					const batch = {
						queue: parsed.queue ?? 'dev-queue',
						messages,
						ackAll() {},
						retryAll() {}
					};
					return mod.queue(batch, proxy.env, proxy.ctx);
				});
			});

			server.middlewares.use('/__email', async (req, res) => {
				if (req.method !== 'POST') return res.end();
				await run(req, res, 'email', (mod, body) => {
					const message = {
						from: req.headers['x-from']?.toString() ?? 'dev@example.com',
						to: req.headers['x-to']?.toString() ?? 'dev@example.com',
						headers: new Headers(),
						raw: new Blob([body]).stream(),
						rawSize: body.length,
						setReject() {},
						async forward() {},
						async reply() {}
					};
					return mod.email(message, proxy.env, proxy.ctx);
				});
			});

			server.httpServer?.on('close', () => {
				proxy.dispose();
			});
		}
	};
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<string>}
 */
function read_body(req) {
	return new Promise((resolve, reject) => {
		/** @type {Buffer[]} */
		const chunks = [];
		req.on('data', (chunk) => chunks.push(chunk));
		req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
		req.on('error', reject);
	});
}
