# Changelog

This changelog tracks fork-owned releases of `@joshthomas/sveltekit-adapter-cloudflare`.

Pre-fork history lives in the upstream SvelteKit adapter changelog:
https://github.com/sveltejs/kit/blob/main/packages/adapter-cloudflare/CHANGELOG.md

## 0.1.0 - 2026-04-21

- forked from `@sveltejs/adapter-cloudflare` `7.2.8`
- added support for Cloudflare `scheduled`, `queue`, and `email` handlers
- supports convention-based handler discovery via `<kit.files.src>/handlers.cloudflare.<ext>`
- supports an explicit `handlers: 'path/to/file'` adapter option
- keeps SvelteKit in control of `fetch`
- preserves extracted upstream git history in this repo
