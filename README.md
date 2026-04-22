# sveltekit-adapter-cloudflare

A drop-in replacement for [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare) that adds support for Cloudflare `scheduled`, `queue`, and `email` handlers.

## About this fork

This is a fork of [`@sveltejs/adapter-cloudflare`](https://svelte.dev/docs/kit/adapter-cloudflare) that adds support for Cloudflare's non-HTTP worker handlers: `scheduled`, `queue`, and `email`. If you do not use a handler file, it behaves like the upstream adapter.

This was requested upstream multiple times and at least partly explored there, but never landed in the official adapter. I also got tired of copying the same handler wiring from project to project. This fork takes the narrower version of that idea: SvelteKit still owns `fetch`, and the user supplies only extra Cloudflare handlers.

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

Then create `src/handlers.cloudflare.js` (or `.ts`) and export any subset of `scheduled`, `queue`, and `email`:

```js
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

The adapter adds these exports to the generated worker. It does not replace SvelteKit's `fetch` handler.

See the Cloudflare docs for [`scheduled`](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/), [`queue`](https://developers.cloudflare.com/queues/configuration/javascript-apis/#consumer), and [`email`](https://developers.cloudflare.com/email-routing/email-workers/runtime-api/).

The adapter discovers handler files automatically by looking for `handlers.cloudflare.<ext>` in `kit.files.src` using `kit.moduleExtensions`. If you want to use a different file, pass it explicitly:

```js
adapter({
	handlers: 'src/workers/my-handlers.js'
});
```

These handlers are added in the adapter output, so they are not available in plain `vite dev`. To test them locally, use your normal Cloudflare preview flow — for example `wrangler pages dev` for Pages or `vite build` followed by `wrangler dev` for Workers.

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
