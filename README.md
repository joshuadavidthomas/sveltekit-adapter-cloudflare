# adapter-cloudflare

[Adapter](https://svelte.dev/docs/kit/building-your-app) for building SvelteKit applications on [Cloudflare Workers](https://developers.cloudflare.com/workers/) with [static assets](https://developers.cloudflare.com/workers/static-assets/) or [Cloudflare Pages](https://developers.cloudflare.com/pages/) with [Workers integration](https://developers.cloudflare.com/pages/functions/).

## Docs

[Docs](https://svelte.dev/docs/kit/adapter-cloudflare)

## Cloudflare handlers

You can add Cloudflare-specific `scheduled`, `queue`, and `email` handlers to the generated worker with a convention file or an explicit adapter option.

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      handlers: 'src/handlers.cloudflare.js'
    })
  }
};

// src/handlers.cloudflare.js
export function scheduled(controller, env, ctx) {
  ctx.waitUntil(Promise.resolve());
}
```

If `handlers` is omitted, the adapter looks for `src/handlers.cloudflare.<ext>` using the extensions from `kit.moduleExtensions`.

## Changelog

[The Changelog for this package is available on GitHub](https://github.com/sveltejs/kit/blob/main/packages/adapter-cloudflare/CHANGELOG.md).
