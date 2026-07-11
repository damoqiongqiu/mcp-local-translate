<p align="center">
  <img src="assets/banner.jpg" alt="MCP Local Translate — Translate across languages, no cloud required." width="600" />
</p>

# MCP Local Translate

[![GitHub stars](https://img.shields.io/github/stars/damoqiongqiu/mcp-local-translate?style=social)](https://github.com/damoqiongqiu/mcp-local-translate)
[![npm version](https://img.shields.io/npm/v/@damoqiongqiu/mcp-local-translate.svg)](https://www.npmjs.com/package/@damoqiongqiu/mcp-local-translate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-green.svg)](https://registry.modelcontextprotocol.io/)

> 🍴 Inspired by [shinpr/mcp-local-rag](https://github.com/shinpr/mcp-local-rag) — original architecture patterns by [Shinsuke Kagawa](https://github.com/shinpr)
>
> Local translation engine for AI coding assistants. Powered by NLLB-200 model, 200+ language pairs — fully offline, zero data leakage. Built for multilingual development, document reading, and code comment translation.

📖 [中文文档](README.md)

---

## Features

- **200+ language pairs**
  Powered by Meta's NLLB-200 distilled model (600M params), covering nearly all human languages — from major ones to low-resource languages.

- **Runs entirely locally**
  No API keys, no cloud services. NLLB-200 runs locally on CPU via Transformers.js. Your data never leaves your machine.

- **Smart language resolution**
  Supports FLORES-200 codes, ISO 639-1, language names, and Chinese aliases — auto-resolved to correct model inputs.

- **Chunked translation for long texts**
  Long texts auto-split at sentence boundaries (450 chars/chunk), translated independently, then reassembled — breaking through NLLB's 512 token limit.

- **Zero-friction setup**
  One `npx` command. No Docker, no Python, no GPU needed. Use via MCP or CLI.

- **Three-tier mirror fallback**
  Auto-probes HuggingFace → hf-mirror.com → ModelScope mirror chain for seamless model downloads behind firewalls.

---

## Quick Start

### Configure Your AI Coding Tool

**Cursor** — Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "local-translate": {
      "command": "npx",
      "args": ["-y", "@damoqiongqiu/mcp-local-translate"],
      "env": {
        "CACHE_DIR": "/path/to/models"
      }
    }
  }
}
```

**Codex** — Add to `~/.codex/config.toml`:
```toml
[mcp_servers.local-translate]
command = "npx"
args = ["-y", "@damoqiongqiu/mcp-local-translate"]

[mcp_servers.local-translate.env]
CACHE_DIR = "/path/to/models"
```

**Claude Code** — Run this command:
```bash
claude mcp add local-translate --scope user --env CACHE_DIR=/path/to/models -- npx -y @damoqiongqiu/mcp-local-translate
```

**WorkBuddy** — Open Settings → Custom Connectors → Add Custom Connector:

```json
{
  "mcpServers": {
    "local-translate": {
      "command": "npx",
      "args": ["-y", "@damoqiongqiu/mcp-local-translate"],
      "env": {
        "CACHE_DIR": "/path/to/models"
      }
    }
  }
}
```

Restart your tool, then start using it:

```
You: "Translate this doc to Chinese"
Assistant: [Returns translation]

You: "This error message is in Japanese — what does it say?"
Assistant: It says "Database connection failed" —
          database connection failed.

You: "List all supported languages"
Assistant: 204 languages, including Chinese, English...
```

**Or use directly as CLI — no MCP server needed:**

```bash
npx @damoqiongqiu/mcp-local-translate translate "Hello, world!" --source en --target zh
npx @damoqiongqiu/mcp-local-translate list-languages --query "chinese"
```

That's it. No Docker, no Python, no server setup.

---

## Why This Exists

Your AI coding assistant can write code, but when you face non-native docs, comments, or error logs, you still need to leave your IDE and copy-paste into online translators.

**Privacy.** Pasting code snippets or internal docs into Google Translate is data leakage. This runs entirely locally — nobody sees your text.

**Offline.** Works without internet after setup — on a plane, in a coffee shop with no WiFi, in air-gapped environments.

**Low-resource languages.** NLLB-200 covers languages that Google Translate and DeepL don't — Tibetan, Uyghur, Khmer, and more.

**Cost.** No per-character translation API fees. One-time model download (~600MB), then unlimited use.

---

## Usage

mcp-local-translate provides two interfaces: an **MCP server** for AI coding tools and a **CLI** for direct use from the terminal.

### Using with MCP

The MCP server provides 2 tools: `translate` and `list_languages`.

#### Translating Text

```
"Translate this React hooks doc to Chinese"
"Translate the error message to English"
"What does this Japanese comment mean?"
```

The `translate` tool accepts:

| Param | Type | Description |
|--------|------|-------------|
| `text` | `string` | Text to translate |
| `source_lang` | `string` | Source language code (`auto` for auto-detect) |
| `target_lang` | `string` | Target language code |

Language codes support three formats:
- **Exact codes**: `zho_Hans` (Simplified Chinese), `eng_Latn` (English), `jpn_Jpan` (Japanese)
- **Short codes**: `zh`, `en`, `ja`, `fr`, `de`
- **Chinese aliases**: `中文`, `英语`, `日语`, `韩语`

#### Listing Languages

```
"How many languages does this engine support?"
"Does it support Tibetan?"
```

Use the `list_languages` tool with an optional `query` parameter for filtering.

### Using as CLI

All MCP tools are also available as CLI commands — no MCP server needed:

```bash
# Translate text
npx @damoqiongqiu/mcp-local-translate translate "Hello, world!" --source en --target zh

# Auto-detect source language
npx @damoqiongqiu/mcp-local-translate translate "Bonjour le monde" --source auto --target en

# List supported languages
npx @damoqiongqiu/mcp-local-translate list-languages

# Filter by keyword
npx @damoqiongqiu/mcp-local-translate list-languages --query "chinese"
```

> The CLI does **not** read your MCP client config (`mcp.json`, `config.toml`, etc.). Configure the CLI via flags or environment variables as shown below.

---

## How It Works

**TL;DR:**
- Language codes are resolved three ways (exact → alias → fuzzy) to FLORES-200 format
- Long text split at sentence boundaries (450 chars/chunk), translated independently
- Translation uses Transformers.js with NLLB-200 distilled model (600M params), CPU inference via ONNX
- Results reassembled in original order, preserving paragraph and newline structure

### Details

When you call `translate`:

1. **Language resolution**: Input language codes resolve through three tiers — exact FLORES-200 match first, then ISO 639-1 alias lookup, then Chinese alias lookup. Failed resolutions trigger fuzzy search with suggestions.

2. **Text preprocessing**: Long texts (>450 chars) split at sentence boundaries via `/(?<=[.!?。！？\n])\s+/` regex, ensuring clean sentence breaks. Each chunk gets source/target language tokens.

3. **Model inference**: Each chunk passes through the NLLB-200 distilled model. Lazy initialization — model downloads and loads into memory on first `translate` call, then reused for subsequent calls.

4. **Result assembly**: Translated chunks are concatenated in original order. Paragraph and line breaks between chunks are preserved.

---

## Configuration

### Environment Variables

The MCP server is configured by environment variables only — pass them through your MCP client's `env` block.

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `CACHE_DIR` | system default | Model cache directory. NLLB-200 (~600MB) auto-downloads here. Absolute path recommended. |
| `HF_ENDPOINT` | `https://huggingface.co` | HuggingFace mirror endpoint. When set, auto-mirror detection is skipped. |
| `HF_AUTO_MIRROR` | `true` | Auto-mirror detection. Set to `false` to disable. Probes three-tier chain. |
| `HTTPS_PROXY` | (unset) | HTTP proxy for model downloads. Globally effective via `setGlobalDispatcher`. |
| `TRANSLATE_DEVICE` | `cpu` | Execution device passed to Transformers.js. `cpu` is recommended. |

---

<details>
<summary><strong>Performance</strong></summary>

Tested on MacBook Pro M1 (16GB RAM), Node.js 22:

**Cold start**:
- Model download: 1–3 minutes (depending on network, ~600MB)
- Model loading: ~5s

**Translation speed**:
- Short text (<100 chars): <1s
- Medium text (500 chars): ~3s
- Long text (2000 chars): ~12s (4 chunks)

**Memory**: ~300MB idle, ~1.2GB peak during translation

</details>

<details>
<summary><strong>Troubleshooting</strong></summary>

### Model download failed

**Symptom**: `fetch failed` in startup logs or model loading timeout.

**Causes & diagnosis**:

1. **Cannot reach HuggingFace directly** — If you are in mainland China or a restricted network, direct connection to `huggingface.co` will time out.

   **Preferred: No config needed** — mcp-local-translate auto-probes the three-tier mirror chain by default: `huggingface.co` → `hf-mirror.com` → `modelscope.cn`, falling back until a reachable mirror is found.

   **Alternative: Configure proxy**:
   ```json
   "env": {
     "HTTPS_PROXY": "http://127.0.0.1:7890"
   }
   ```

   **Manually specify a mirror**:
   ```json
   "env": {
     "HF_ENDPOINT": "https://hf-mirror.com"
   }
   ```

2. **Model files not written to `CACHE_DIR`** — The first run downloads ~600MB of ONNX model files. Verify that `CACHE_DIR` exists and contains the `Xenova/nllb-200-distilled-600M/` subdirectory. If you previously downloaded the model with a different `CACHE_DIR`, point to the existing cache to avoid re-downloading.

3. **npx cached an older version** — Clear cache and restart:
   ```bash
   rm -rf ~/.npm/_npx/
   ```

### "Invalid language code"

Run `list_languages` to see all supported languages and their codes. Language codes use the FLORES-200 format (e.g., `zho_Hans`, `eng_Latn`), or ISO 639-1 short codes (e.g., `zh`, `en`), or Chinese aliases (e.g., `中文`, `英语`).

### Slow translation speed

NLLB-200 runs on CPU, so translation speed depends on your hardware. Long texts are automatically chunked for processing, ~2–3 seconds per chunk.

</details>

<details>
<summary><strong>FAQ</strong></summary>

**Is this really private?**
Yes. After model download, nothing leaves your machine. Verify with network monitoring.

**Can I use this offline?**
Yes, after the NLLB-200 model is cached locally.

**How does this compare to Google Translate / DeepL?**
Cloud services offer higher quality (larger models, more training data) but require sending data externally. This trades some quality for total privacy and zero cost.

**What languages are supported?**
NLLB-200 supports 200+ languages. Run `list_languages` for the full list.

**Are dialects supported?**
NLLB-200 covers some dialectal variants (e.g., Brazilian Portuguese, Latin American Spanish) but not as broadly as major languages. Depends on training data.

**What about translation quality?**
For major language pairs (EN↔ZH, EN↔FR, EN↔ES), the 600M distilled model delivers decent quality. For low-resource languages, quality drops — readable but not elegant.

**Multi-user support?**
No. Designed for single-user, local access.

</details>

<details>
<summary><strong>Development</strong></summary>

### Building from Source

```bash
git clone https://github.com/damoqiongqiu/mcp-local-translate.git
cd mcp-local-translate
pnpm install
```

### Code Quality

```bash
pnpm run type-check    # TypeScript check
pnpm run check:fix     # Lint and format
pnpm run build         # Compile
```

### Project Structure

```
src/
  index.ts              # Entry point — routes to CLI or MCP server
  server-main.ts        # MCP server startup
  server/
    index.ts            # MCP tool handlers (translate, list_languages)
    types.ts            # MCP tool definitions
  translator/
    index.ts            # Core translation engine (NLLB-200 pipeline, chunking, lazy load)
    connectivity.ts     # Mirror detection and proxy configuration
    language-codes.ts   # FLORES-200 language codes and resolver
  utils/                # Shared utilities
skills/                 # Agent Skills shipped with the package
```

</details>

---

## Agent Skills

[Agent Skills](https://agentskills.io/) provide optimized prompts that help AI assistants use the translation tools more effectively:

```bash
# Claude Code (project-level)
npx @damoqiongqiu/mcp-local-translate skills install --claude-code

# Claude Code (user-level)
npx @damoqiongqiu/mcp-local-translate skills install --claude-code --global

# Codex
npx @damoqiongqiu/mcp-local-translate skills install --codex
```

Skills include:
- **Language code usage**: Mapping rules for FLORES-200, ISO 639-1, Chinese aliases
- **Long text translation**: Auto-chunking strategy and result interpretation
- **CN network config**: Mirror settings and proxy configuration

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and guidelines.

## License

MIT License. Free for personal and commercial use.

## Acknowledgments

Architecture patterns inspired by [mcp-local-rag](https://github.com/damoqiongqiu/mcp-local-rag) by [Shinsuke Kagawa](https://github.com/shinpr). Built with [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic and [Transformers.js](https://huggingface.co/docs/transformers.js). Translation model: [NLLB-200](https://ai.meta.com/research/no-language-left-behind/) by Meta AI.
