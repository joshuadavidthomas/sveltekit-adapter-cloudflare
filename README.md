# sveltekit-adapter-cloudflare

A drop-in replacement for [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare) that adds support for Cloudflare platform extensions beyond the generated SvelteKit `fetch` worker.

## About this fork

This is a fork of [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare) that adds support for a user-owned Cloudflare platform file. If you do not use one, it behaves like the upstream adapter.

This was requested upstream multiple times and at least partly explored there, but never landed in the official adapter. I also got tired of copying the same handler wiring from project to project — and later, of bending over backwards to get Durable Objects to work alongside it. This fork takes a narrower version of "own the worker": SvelteKit still owns `fetch`, and the user supplies a single platform file with everything else — `scheduled`, `queue`, `email`, and `tail` handlers, plus named exports such as Durable Object classes, `WorkerEntrypoint` classes, and `WorkflowEntrypoint` classes.

## Compatibility

| Fork version | Upstream base                        | SvelteKit | Wrangler   |
| ------------ | ------------------------------------ | --------- | ---------- |
| 0.3.x        | `@sveltejs/adapter-cloudflare` 8.0.1 | 3.x       | `^4.118.0` |
| 0.1.x–0.2.x  | `@sveltejs/adapter-cloudflare` 7.2.8 | 2.x       | `^4.0.0`   |

## Installation

Install the adapter:

```bash
npm install -D @joshthomas/sveltekit-adapter-cloudflare
```

## Usage

Pass the adapter to the SvelteKit plugin in your `vite.config.js`:

```js
import adapter from '@joshthomas/sveltekit-adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({ adapter: adapter() })]
});
```

Then create `src/platform.cloudflare.js` (or `.ts`) and export any Cloudflare-specific additions you need:

```js
import { DurableObject } from 'cloudflare:workers';

export class MyDurableObject extends DurableObject {}

export async function scheduled(controller, env, ctx) {
	// run cron work here
}

export async function queue(batch, env, ctx) {
	for (const message of batch.messages) {
		// process message.body here
		message.ack();
	}
}

export async function email(message, env, ctx) {
	// handle incoming email here
}
```

The adapter re-exports everything from this file and merges any `scheduled`, `queue`, `email`, or `tail` exports into the generated worker's default export. It does not replace SvelteKit's `fetch` handler.

See the Cloudflare docs for handler signatures — [`scheduled`](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/), [`queue`](https://developers.cloudflare.com/queues/configuration/javascript-apis/#consumer), [`email`](https://developers.cloudflare.com/email-routing/email-workers/runtime-api/), [`tail`](https://developers.cloudflare.com/workers/runtime-apis/handlers/tail/) — and for class-based exports: [Durable Objects](https://developers.cloudflare.com/durable-objects/), [`WorkerEntrypoint`](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/), and [Workflows](https://developers.cloudflare.com/workflows/).

The adapter discovers platform files automatically by looking for `platform.cloudflare.<ext>` in `files.src` using `moduleExtensions`. If you want to use a different file, pass it explicitly:

```js
adapter({
	platform: 'src/workers/my-platform.js'
});
```

Remember to declare Durable Object bindings and migrations, and any cron triggers or queue consumers, in your Wrangler configuration as usual.

The platform file is bundled by Wrangler rather than Vite, so it cannot import SvelteKit modules such as `$lib` or `$app/*`.

These exports are wired in the adapter output, so they are not available in plain `vite dev` (where bindings to Durable Objects defined in your own worker do not work either). To test them locally, use your normal Cloudflare preview flow — for example `wrangler pages dev` for Pages or `vite build` followed by `wrangler dev` for Workers. Add `--test-scheduled` to `wrangler dev` to trigger your `scheduled` handler at `/__scheduled`.

## Runtime APIs

As with upstream 8.x, your bindings are available from the [`cloudflare:workers`](https://developers.cloudflare.com/workers/runtime-apis/bindings/#importing-env-as-a-global) module, which the adapter emulates during `vite dev` and `vite preview`:

```js
import { env } from 'cloudflare:workers';

export async function GET() {
	return new Response(await env.MY_KV.get('key'));
}
```

Like upstream 8.x, the adapter no longer sets SvelteKit's `platform`. If you are upgrading from 0.2.x:

| Before            | After                                            |
| ----------------- | ------------------------------------------------ |
| `platform.env`    | `import { env } from 'cloudflare:workers'`       |
| `platform.ctx`    | `import { waitUntil } from 'cloudflare:workers'` |
| `platform.cf`     | `request.cf`                                     |
| `platform.caches` | the global `caches`                              |

This only affects SvelteKit routes and hooks. Handlers in the platform file still receive `env` and `ctx` as arguments from Cloudflare.

Run [`wrangler types`](https://developers.cloudflare.com/workers/languages/typescript/) to generate types for `cloudflare:workers`.

For the rest of the adapter behavior and options, see the [upstream docs](https://svelte.dev/docs/kit/adapter-cloudflare).

## Development

To work on the adapter locally:

```bash
pnpm install
pnpm check
pnpm test:unit
pnpm test:e2e
```

## License

sveltekit-adapter-cloudflare is licensed under the MIT license. See the [`LICENSE`](LICENSE) file for more information.
