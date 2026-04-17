import type { Plugin } from 'vite';
import type { GetPlatformProxyOptions } from 'wrangler';

export interface CloudflareDevHandlersOptions {
	/**
	 * Path to the module that exports `scheduled`, `queue`, and/or `email` handlers.
	 * @default 'src/hooks.cloudflare.js' (or .ts/.mjs, whichever exists)
	 */
	entry?: string;

	/**
	 * Options forwarded to `getPlatformProxy`.
	 */
	platformProxy?: GetPlatformProxyOptions;
}

/**
 * Vite dev-server plugin that exposes HTTP routes for invoking the non-fetch
 * Cloudflare handlers declared in `src/hooks.cloudflare.{js,ts,mjs}`:
 *
 * - `POST /__scheduled?cron=<pattern>` → `scheduled`
 * - `POST /__queue`                    → `queue` (body: `{ queue, messages: [{ body, ... }] }`)
 * - `POST /__email`                    → `email` (body: raw message)
 */
export function cloudflareDevHandlers(options?: CloudflareDevHandlersOptions): Plugin;
