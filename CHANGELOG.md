# Changelog

All notable changes to this project will be documented in this file.

## [0.1.9] — 2026-07-11

### Added
- **Batch translation** (`translate_batch` tool): translate multiple texts in parallel with a single MCP call. All texts share the same glossary and direction — returns an array of `{text, translated, fromCache}` objects.
- **Status check** (`status` tool): query engine readiness, model download progress, endpoint routing, and cache statistics without performing a translation. Useful for health checks before delegating translation work.
- **LRU translation cache**: in-memory cache keyed by `(source_lang, target_lang, text)` with configurable max size (default 5000). Cached hits return instantly with `fromCache: true`. Evicts oldest entries when the limit is reached.
- **Glossary / terminology support**: pass a `glossary` object (`{ "源术语": "Target Term" }`) to `translate` or `translate_batch`. Source terms are replaced with placeholders before inference and restored after — model never sees the original terms, ensuring consistent terminology across translations.
- **Parallel chunk translation**: long texts split across multiple chunks are now translated concurrently via `Promise.all()` instead of serial iteration, giving ~2–3x speedup on multi-chunk texts.
- **MCP Resource protocol support**: exposes `translate://status` (engine state JSON) and dynamic `translate://{src}→{tgt}?text={encoded}` resources for programmatic read access without invoking tools.
- **Dynamic version from package.json**: server version is now read from `package.json` at startup via `createRequire`, no more hardcoded version strings.

### Fixed
- Unused proxy config fields removed from old mirror probe logic (leftover from pre-v0.1.8 refactor).

## [0.1.8] — 2026-07-11

### Fixed
- **Critical: proxy setup was after endpoint resolution**, causing `resolveEndpoint()` probes to bypass the proxy entirely. When a proxy is configured (e.g. `HTTPS_PROXY` for Chinese networks), the endpoint auto-detection now correctly routes through it — `huggingface.co` becomes reachable directly instead of falling back to incomplete mirrors. Also added `proxyTunnel: true` for consistent proxy behavior, and fallback to `HTTPS_PROXY`/`HTTP_PROXY` env vars (matching mcp-local-rag's approach).

## [0.1.0] — 2026-07-11

### Added
- Initial release: local translation engine via MCP and CLI
- NLLB-200 distilled model (`Xenova/nllb-200-distilled-600M`) for 200+ language translation
- `translate` MCP tool with `auto` source language detection placeholder
- `list_languages` MCP tool with keyword filtering
- Three-tier language code resolution: FLORES-200 exact codes, ISO 639-1 aliases, Chinese name aliases
- Chunked translation for long texts (sentence-boundary splitting, 450 chars/chunk)
- Three-tier mirror auto-detection: huggingface.co → hf-mirror.com → modelscope.cn
- Global proxy support via `setGlobalDispatcher` + ProxyAgent
- TypeScript 6.0 strict mode, Node.js 22, ES Modules
- CLI interface: `translate` and `list-languages` subcommands
- Agent Skills: bundled <code>mcp-local-translate</code> skill for optimized AI assistant usage
- Banner image with dark sci-fi tech aesthetic
