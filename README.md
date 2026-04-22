# @joshthomas/sveltekit-adapter-cloudflare

Fork of [`@sveltejs/adapter-cloudflare`](https://www.npmjs.com/package/@sveltejs/adapter-cloudflare) that adds Cloudflare worker handler support for `scheduled`, `queue`, and `email` while leaving SvelteKit in control of `fetch`.

This README is the canonical documentation for the fork-specific behavior. For the base adapter behavior, deployment model, and general Cloudflare adapter guidance, use the upstream SvelteKit docs as a reference.

## Install

```bash
npm install -D @joshthomas/sveltekit-adapter-cloudflare
```

## Usage

```js
// svelte.config.js
import adapter from '@joshthomas/sveltekit-adapter-cloudflare';

export default {
	kit: {
		adapter: adapter({
			handlers: 'src/handlers.cloudflare.js'
		})
	}
};
```

```js
// src/handlers.cloudflare.js
export function scheduled(controller, env, ctx) {
	ctx.waitUntil(Promise.resolve(`${controller.cron}:${String(!!env)}`));
}

export function queue(batch, env, ctx) {
	ctx.waitUntil(Promise.resolve(`${batch.messages.length}:${String(!!env)}`));
}

export async function email(message, env, ctx) {
	ctx.waitUntil(Promise.resolve(`${message.from}:${String(!!env)}`));
}
```

The handler file can export any subset of:
- `scheduled`
- `queue`
- `email`

If `handlers` is omitted, the adapter looks for `<kit.files.src>/handlers.cloudflare.<ext>` using `kit.moduleExtensions`.

## Contract

- SvelteKit still owns `fetch`.
- The handler file augments the generated worker; it does not replace the worker entrypoint.
- This fork does not add a custom `fetch` escape hatch or a separate worker-definition API.

## Development note

These handlers are part of the generated Cloudflare worker output. They do **not** run in plain `vite dev`.

To test handler behavior locally, use the Cloudflare runtime path:
- `wrangler dev`
- `wrangler pages dev`
- the relevant preview/build flow for your Cloudflare target

## Reference docs

- Upstream adapter docs: https://svelte.dev/docs/kit/adapter-cloudflare
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- Cloudflare Pages docs: https://developers.cloudflare.com/pages/

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md).
