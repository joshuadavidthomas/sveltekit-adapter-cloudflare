# sveltekit-adapter-cloudflare

A drop-in replacement for [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare) that adds support for Cloudflare platform extensions beyond the generated SvelteKit `fetch` worker.

## About this fork

This is a fork of [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare) that adds support for a user-owned Cloudflare platform file. If you do not use one, it behaves like the upstream adapter.

This was requested upstream multiple times and at least partly explored there, but never landed in the official adapter. I also got tired of copying the same handler wiring from project to project — and later, of bending over backwards to get Durable Objects to work alongside it. This fork takes a narrower version of "own the worker": SvelteKit still owns `fetch`, and the user supplies a single platform file with everything else — `scheduled`, `queue`, `email`, and `tail` handlers, plus named exports such as Durable Object classes, `WorkerEntrypoint` classes, and `WorkflowEntrypoint` classes.

## Installation

Install the adapter:

```bash
npm install -D @joshthomas/sveltekit-adapter-cloudflare
```

## Usage

Configure SvelteKit to use the adapter:

```js
import adapter from '@joshthomas/sveltekit-adapter-cloudflare';

export default {
	kit: {
		adapter: adapter()
	}
};
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

The adapter discovers platform files automatically by looking for `platform.cloudflare.<ext>` in `kit.files.src` using `kit.moduleExtensions`. If you want to use a different file, pass it explicitly:

```js
adapter({
	platform: 'src/workers/my-platform.js'
});
```

These exports are wired in the adapter output, so they are not available in plain `vite dev`. To test them locally, use your normal Cloudflare preview flow — for example `wrangler pages dev` for Pages or `vite build` followed by `wrangler dev` for Workers.

For the rest of the adapter behavior and options, see the [upstream docs](https://svelte.dev/docs/kit/adapter-cloudflare).

## Development

To work on the adapter locally:

```bash
pnpm install
pnpm build
pnpm check
pnpm test:unit
pnpm test:e2e
```

## License

sveltekit-adapter-cloudflare is licensed under the MIT license. See the [`LICENSE`](LICENSE) file for more information.
