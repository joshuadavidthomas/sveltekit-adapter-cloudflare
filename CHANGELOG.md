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

[Unreleased]: https://github.com/joshuadavidthomas/sveltekit-adapter-cloudflare/compare/v0.2.0...HEAD
[0.1.0]: https://github.com/joshuadavidthomas/sveltekit-adapter-cloudflare/releases/tag/v0.1.0
[0.2.0]: https://github.com/joshuadavidthomas/sveltekit-adapter-cloudflare/releases/tag/v0.2.0
