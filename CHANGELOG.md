# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project attempts to adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This changelog tracks fork-owned releases of `@joshthomas/sveltekit-adapter-cloudflare`. Pre-fork history lives in the [upstream SvelteKit adapter changelog](https://github.com/sveltejs/kit/blob/main/packages/adapter-cloudflare/CHANGELOG.md).

<!--
## [${version}]
### Added - for new features
### Changed - for changes in existing functionality
### Deprecated - for soon-to-be removed features
### Removed - for now removed features
### Fixed - for any bug fixes
### Security - in case of vulnerabilities
[${version}]: https://github.com/joshuadavidthomas/sveltekit-adapter-cloudflare/releases/tag/v${version}
-->

## [Unreleased]

### Added

- Added emulation of the `cloudflare:workers` module during `vite dev` and `vite preview`, from upstream 8.x. `import { env } from 'cloudflare:workers'` now works in dev.
- Added `Request.cf` during `vite dev` and `vite preview` through the `vite.getRequest` adapter hook, from upstream 8.x.

### Changed

- **Breaking:** Rebased the fork on `@sveltejs/adapter-cloudflare` `8.0.1`. It now requires SvelteKit 3 (`@sveltejs/kit` `^3.0.0-next.0`) and Wrangler `^4.118.0`, and is passed to the SvelteKit Vite plugin (`sveltekit({ adapter })`) like the upstream adapter. See the [upstream 8.0.0 changelog](https://github.com/sveltejs/kit/blob/main/packages/adapter-cloudflare/CHANGELOG.md#800) for the rest of what changed, such as Workers Caching replacing the Cache API and `builder.generateServerInstance` replacing `builder.generateManifest`.
- Bumped `@cloudflare/workers-types` to `^5.20260925.1` and replaced `worktop` with `@rolldown/pluginutils`, as upstream did.
- The platform file is now discovered in `files.src` using `moduleExtensions`, the SvelteKit 3 names for `kit.files.src` and `kit.moduleExtensions`.

### Removed

- **Breaking:** Removed SvelteKit's `platform` (`env`, `ctx`, `context`, `caches`, `cf`), as upstream 8.x did. Use `env` and `waitUntil` from `cloudflare:workers`, `request.cf`, and the global `caches` instead. Handlers in the platform file are unaffected.

### Fixed

- Fixed `vite build` failing on SvelteKit 3 with `adapter_generate_manifest_removed`, and the `adapter_config_kit_deprecated` warning.
- Fixed named platform-file exports (such as Durable Object classes) being dropped from the worker when `instrumentation.server.js` is used.

## [0.2.1]

### Fixed

- Fixed esbuild `import-is-undefined` warnings against the generated worker when the platform file doesn't define every handler slot.

## [0.2.0]

### Added

- Added `tail` handler to the set of merged Cloudflare handlers.
- Added re-export of all named exports from the platform file (e.g. Durable Object classes, `WorkerEntrypoint`, `WorkflowEntrypoint`) from the generated worker.

### Changed

- **Breaking:** Replaced the handlers-only convention with a platform extension convention. Renamed `handlers.cloudflare.<ext>` to `platform.cloudflare.<ext>` and the adapter option `handlers` to `platform`.

## [0.1.0]

### Added

- Forked from `@sveltejs/adapter-cloudflare` `7.2.8`, preserving extracted upstream git history in this repo.
- Added support for Cloudflare `scheduled`, `queue`, and `email` handlers, kept separate from SvelteKit's `fetch` handler.
- Added convention-based handler discovery via `<kit.files.src>/handlers.cloudflare.<ext>`.
- Added explicit `handlers: 'path/to/file'` adapter option to override the convention path.

[Unreleased]: https://github.com/joshuadavidthomas/sveltekit-adapter-cloudflare/compare/v0.2.1...HEAD
[0.1.0]: https://github.com/joshuadavidthomas/sveltekit-adapter-cloudflare/releases/tag/v0.1.0
[0.2.0]: https://github.com/joshuadavidthomas/sveltekit-adapter-cloudflare/releases/tag/v0.2.0
[0.2.1]: https://github.com/joshuadavidthomas/sveltekit-adapter-cloudflare/releases/tag/v0.2.1
