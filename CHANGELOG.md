# Changelog

All notable changes to this project will be documented in this file.

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
