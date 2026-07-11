<p align="center">
  <img src="assets/banner.jpg" alt="MCP Local Translate — 跨越语言，无需云。 / Translate across languages, no cloud required." width="600" />
</p>

# MCP Local Translate

[![GitHub stars](https://img.shields.io/github/stars/damoqiongqiu/mcp-local-translate?style=social)](https://github.com/damoqiongqiu/mcp-local-translate)
[![npm version](https://img.shields.io/npm/v/@damoqiongqiu/mcp-local-translate.svg)](https://www.npmjs.com/package/@damoqiongqiu/mcp-local-translate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-green.svg)](https://registry.modelcontextprotocol.io/)

> 🍴 Inspired by [shinpr/mcp-local-rag](https://github.com/shinpr/mcp-local-rag) — original architecture patterns by [Shinsuke Kagawa](https://github.com/shinpr)
>
> AI 编程助手的本地翻译引擎。基于 NLLB-200 模型，支持 200+ 语言互译——完全离线，数据不离开你的机器。为多语言开发、文档阅读、代码注释翻译而生。
>
> Local translation engine for AI coding assistants. Powered by NLLB-200 model, 200+ language pairs — fully offline, zero data leakage. Built for multilingual development, document reading, and code comment translation.

---

## 特性 / Features

- **200+ 语言互译 / 200+ language pairs**
  基于 Meta NLLB-200 蒸馏模型（600M 参数），覆盖全球绝大多数语言——从主流语言到低资源语言。
  Powered by Meta's NLLB-200 distilled model (600M params), covering nearly all human languages — from major ones to low-resource languages.

- **完全本地运行 / Runs entirely locally**
  无需 API Key，无需云服务。NLLB-200 模型在本地 CPU 上通过 Transformers.js 推理。数据从不离开你的机器。
  No API keys, no cloud services. NLLB-200 runs locally on CPU via Transformers.js. Your data never leaves your machine.

- **智能语言解析 / Smart language resolution**
  支持 FLORES-200 精确码（`zho_Hans`）、ISO 639-1 简码（`zh`）、语言名称（`Chinese`）、中文别名（`中文`）——自动映射到正确的模型输入。
  Supports FLORES-200 codes, ISO 639-1, language names, and Chinese aliases — auto-resolved to correct model inputs.

- **长文本分块翻译 / Chunked translation for long texts**
  长文本在句子边界处自动分块（450 字符/块），每块独立翻译后拼接——突破 NLLB 的 512 token 限制。
  Long texts auto-split at sentence boundaries (450 chars/chunk), translated independently, then reassembled — breaking through NLLB's 512 token limit.

- **零摩擦上手 / Zero-friction setup**
  一条 `npx` 命令搞定。无需 Docker、Python、GPU。可通过 MCP 或 CLI 使用。
  One `npx` command. No Docker, no Python, no GPU needed. Use via MCP or CLI.

- **三级镜像回退 / Three-tier mirror fallback**
  自动探测 HF → hf-mirror.com → ModelScope 三级镜像链，国内网络环境下自动找到可用的模型下载源。
  Auto-probes HuggingFace → hf-mirror.com → ModelScope mirror chain for seamless model downloads behind firewalls.

---

## 快速开始 / Quick Start

### 配置 AI 编程工具 / Configure Your AI Coding Tool

**Cursor** — 添加到 `~/.cursor/mcp.json` / Add to `~/.cursor/mcp.json`：
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

**Codex** — 添加到 `~/.codex/config.toml` / Add to `~/.codex/config.toml`：
```toml
[mcp_servers.local-translate]
command = "npx"
args = ["-y", "@damoqiongqiu/mcp-local-translate"]

[mcp_servers.local-translate.env]
CACHE_DIR = "/path/to/models"
```

**Claude Code** — 运行以下命令 / Run this command：
```bash
claude mcp add local-translate --scope user --env CACHE_DIR=/path/to/models -- npx -y @damoqiongqiu/mcp-local-translate
```

**WorkBuddy** — 打开「设置 → 自定义连接器 → 添加自定义连接器」/ Open Settings → Custom Connectors → Add Custom Connector：

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

> ⚠️ **首次添加后，必须在「自定义连接器」列表中点击「信任」按钮**，否则 MCP 服务器不会启动。这是 WorkBuddy 的安全机制——未经信任的自定义连接器会被静默阻止。

重启工具后即可使用 / Restart your tool, then start using it：

```
你: "把这段文档翻译成中文"                        / You: "Translate this doc to Chinese"
助手: [返回翻译结果]                                / Assistant: [Returns translation]

你: "This error message is in Japanese — what does it say?"
助手: 那是「データベース接続に失敗しました」——     / Assistant: It says "Database connection failed" —
      数据库连接失败。                               /           database connection failed.

你: "列出所有支持的翻译语言"                        / You: "List all supported languages"
助手: 共 204 种语言，包括 中文、英语、日语、法语...  / Assistant: 204 languages, including Chinese, English...
```

**也可直接作为 CLI 使用——无需启动 MCP 服务器 / Or use directly as CLI — no MCP server needed：**

```bash
npx @damoqiongqiu/mcp-local-translate translate "Hello, world!" --source en --target zh
npx @damoqiongqiu/mcp-local-translate list-languages --query "chinese"
```

就这些。无需 Docker，无需 Python，无需配置服务器。
That's it. No Docker, no Python, no server setup.

---

## 为什么会有这个项目 / Why This Exists

你的 AI 编程助手可以帮你写代码，但当你面对非母语的文档、注释、错误日志时，仍然需要跳出编程环境去复制粘贴到在线翻译工具。
Your AI coding assistant can write code, but when you face non-native docs, comments, or error logs, you still need to leave your IDE and copy-paste into online translators.

**隐私 / Privacy。** 把代码片段或内部文档粘贴到 Google Translate 本质上是数据泄露。这个工具完全在本地运行——没有人能看到你的文本。
Pasting code snippets or internal docs into Google Translate is data leakage. This runs entirely locally — nobody sees your text.

**离线可用 / Offline。** 配置完成后无需联网即可使用——飞机上、咖啡店无 WiFi、空气间隙环境。
Works without internet after setup — on a plane, in a coffee shop with no WiFi, in air-gapped environments.

**低资源语言 / Low-resource languages。** NLLB-200 覆盖了 Google Translate 和 DeepL 不支持的小语言（如藏语、维吾尔语、高棉语等）。
NLLB-200 covers languages that Google Translate and DeepL don't — Tibetan, Uyghur, Khmer, and more.

**成本 / Cost。** 无需为翻译 API 付费。只需一次模型下载（~600MB），然后无限使用。
No per-character translation API fees. One-time model download (~600MB), then unlimited use.

---

## 使用方式 / Usage

mcp-local-translate 提供两种接口：**MCP 服务器**（供 AI 编程工具使用）和 **CLI**（供终端直接使用）。
mcp-local-translate provides two interfaces: an **MCP server** for AI coding tools and a **CLI** for direct use from the terminal.

### 通过 MCP 使用 / Using with MCP

MCP 服务器提供 2 个工具：`translate` 和 `list_languages`。
The MCP server provides 2 tools: `translate` and `list_languages`.

#### 翻译文本 / Translating Text

```
"把这段 React hooks 文档翻译成中文"                / "Translate this React hooks doc to Chinese"
"Translate the error message to English"             / "把这个错误信息翻译成英文"
"这段日语注释是什么意思？"                           / "What does this Japanese comment mean?"
```

`translate` 工具接受：
The `translate` tool accepts:

| 参数 / Param | 类型 / Type | 说明 / Description |
|---------------|-------------|---------------------|
| `text` | `string` | 待翻译文本 / Text to translate |
| `source_lang` | `string` | 源语言代码（`auto` 自动检测）/ Source language code (`auto` for auto-detect) |
| `target_lang` | `string` | 目标语言代码 / Target language code |

语言代码支持三种格式 / Language codes support three formats：
- **FLORES-200 精确码 / Exact codes**：`zho_Hans`（简体中文）、`eng_Latn`（英语）、`jpn_Jpan`（日语）
- **ISO 639-1 简码 / Short codes**：`zh`、`en`、`ja`、`fr`、`de`
- **中文别名 / Chinese aliases**：`中文`、`英语`、`日语`、`韩语`

#### 查看支持的语言 / Listing Languages

```
"这个翻译引擎支持多少种语言？"                      / "How many languages does this engine support?"
"看看有没有藏语"                                    / "Does it support Tibetan?"
```

使用 `list_languages` 工具，可选 `query` 参数进行关键词过滤。
Use the `list_languages` tool with an optional `query` parameter for filtering.

### 作为 CLI 使用 / Using as CLI

所有 MCP 工具也可以通过 CLI 命令使用——无需启动 MCP 服务器：
All MCP tools are also available as CLI commands — no MCP server needed:

```bash
# 翻译文本 / Translate text
npx @damoqiongqiu/mcp-local-translate translate "Hello, world!" --source en --target zh

# 自动检测源语言 / Auto-detect source language
npx @damoqiongqiu/mcp-local-translate translate "Bonjour le monde" --source auto --target en

# 查看支持的语言 / List supported languages
npx @damoqiongqiu/mcp-local-translate list-languages

# 按关键词过滤 / Filter by keyword
npx @damoqiongqiu/mcp-local-translate list-languages --query "chinese"
```

> ⚠️ CLI **不会**读取你的 MCP 客户端配置（`mcp.json`、`config.toml` 等）。通过命令行标志或环境变量配置 CLI，如下所示。
> The CLI does **not** read your MCP client config (`mcp.json`, `config.toml`, etc.). Configure the CLI via flags or environment variables as shown below.

---

## 工作原理 / How It Works

**简要 / TL;DR：**
- 语言代码通过三级解析器（精确码 → 别名 → 模糊匹配）映射到 FLORES-200 格式
- 长文本在句子边界处分块（450 字符/块），每块独立翻译
- 翻译引擎使用 Transformers.js 加载 NLLB-200 蒸馏模型（600M 参数），在本地 ONNX Runtime 上以 CPU 推理
- 结果按原始顺序拼接，保持段落和换行结构

**Brief / TL;DR:**
- Language codes are resolved three ways (exact → alias → fuzzy) to FLORES-200 format
- Long text split at sentence boundaries (450 chars/chunk), translated independently
- Translation uses Transformers.js with NLLB-200 distilled model (600M params), CPU inference via ONNX
- Results reassembled in original order, preserving paragraph and newline structure

### 详细说明 / Details

当你调用 `translate` 时 / When you call `translate`：

1. **语言解析 / Language resolution**：输入的语言代码经过三级解析——先尝试精确 FLORES-200 匹配（`zho_Hans`），再查 ISO 639-1 别名表（`zh` → `zho_Hans`），最后查中文别名表（`中文` → `zho_Hans`）。如果全部失败，进行模糊搜索并给出建议。
   Input language codes resolve through three tiers — exact FLORES-200 match first, then ISO 639-1 alias lookup, then Chinese alias lookup. Failed resolutions trigger fuzzy search with suggestions.

2. **文本预处理 / Text preprocessing**：超长文本（>450 字符）在句子边界处拆分（正则 `/(?<=[.!?。！？\n])\s+/`），确保不截断到句子中间。每块加上源语言和目标语言标记。
   Long texts (>450 chars) split at sentence boundaries via `/(?<=[.!?。！？\n])\s+/` regex, ensuring clean sentence breaks. Each chunk gets source/target language tokens.

3. **模型推理 / Model inference**：每块通过 NLLB-200 蒸馏模型（`Xenova/nllb-200-distilled-600M`）翻译。模型通过懒加载初始化——首次翻译时下载并加载到内存，后续调用复用同一管道。
   Each chunk passes through the NLLB-200 distilled model. Lazy initialization — model downloads and loads into memory on first `translate` call, then reused for subsequent calls.

4. **结果拼接 / Result assembly**：翻译结果按原始块顺序拼接，标记之间的段落和换行得以保留。
   Translated chunks are concatenated in original order. Paragraph and line breaks between chunks are preserved.

---

## 配置 / Configuration

### 环境变量 / Environment Variables

MCP 服务器仅通过环境变量配置——通过 MCP 客户端的 `env` 块传入。
The MCP server is configured by environment variables only — pass them through your MCP client's `env` block.

| 环境变量 / Env Variable | 默认值 / Default | 描述 / Description |
|--------------------------|------------------|---------------------|
| `CACHE_DIR` | 系统默认 / system default | 模型缓存目录。NLLB-200 模型（~600MB）自动下载到此。建议使用绝对路径。 / Model cache directory. NLLB-200 (~600MB) auto-downloads here. Absolute path recommended. |
| `HF_ENDPOINT` | `https://huggingface.co` | HuggingFace 镜像端点。设置后跳过自动镜像检测。 / HuggingFace mirror endpoint. When set, auto-mirror detection is skipped. |
| `HF_AUTO_MIRROR` | `true` | 自动镜像检测开关。设为 `false` 禁用。默认开启，首次下载前自动探测三级镜像链：`huggingface.co` → `hf-mirror.com` → `modelscope.cn`。 / Auto-mirror detection. Set to `false` to disable. Probes three-tier chain. |
| `HTTPS_PROXY` | （未设置/unset） | HTTP 代理地址，用于下载模型（如 `http://127.0.0.1:7890`）。通过 `setGlobalDispatcher` 全局生效。 / HTTP proxy for model downloads. Globally effective via `setGlobalDispatcher`. |
| `TRANSLATE_DEVICE` | `cpu` | 推理设备。直接传给 Transformers.js。目前仅推荐 `cpu`。 / Execution device passed to Transformers.js. `cpu` is recommended. |

---

<details>
<summary><strong>性能 / Performance</strong></summary>

在 MacBook Pro M1（16GB RAM）、Node.js 22 上测试 / Tested on MacBook Pro M1 (16GB RAM), Node.js 22：

**首次启动 / Cold start**：
- 模型下载 / Model download：1-3 分钟（取决于网络，~600MB）
- 模型加载 / Model loading：~5s

**翻译速度 / Translation speed**：
- 短文本（<100 字符）：<1s
- 中等文本（500 字符）：~3s
- 长文本（2000 字符）：~12s（4 个分块）

**内存 / Memory**：空闲 ~300MB，翻译峰值 ~1.2GB

</details>

<details>
<summary><strong>故障排查 / Troubleshooting</strong></summary>

### 模型下载失败 / Model download failed

**症状**：启动日志中出现 `fetch failed` 或模型加载超时。

**原因与排查**：

1. **网络无法直连 HuggingFace** — 如果你在中国大陆或受限网络环境中，直连 `huggingface.co` 会超时。

   **首选方案：不用配置** — mcp-local-translate 默认自动探测三级镜像链：`huggingface.co` → `hf-mirror.com` → `modelscope.cn`，逐级回退直到找到可用镜像。

   **备选方案：配置代理**：
   ```json
   "env": {
     "HTTPS_PROXY": "http://127.0.0.1:7890"
   }
   ```

   **手动指定镜像**：
   ```json
   "env": {
     "HF_ENDPOINT": "https://hf-mirror.com"
   }
   ```

2. **模型文件未写入 `CACHE_DIR`** — 首次运行时会下载约 600MB 的 ONNX 模型。确认 `CACHE_DIR` 目录存在且包含 `Xenova/nllb-200-distilled-600M/` 子目录。如果之前用不同的 `CACHE_DIR` 下载过模型，更新路径指向已有缓存即可避免重复下载。

3. **npx 缓存了旧版本** — 清除缓存后重启：
   ```bash
   rm -rf ~/.npm/_npx/
   ```

### "Invalid language code" / "无效的语言代码"

运行 `list_languages` 查看所有支持的语言及其代码。语言代码是 FLORES-200 格式（如 `zho_Hans`、`eng_Latn`），也可以使用 ISO 639-1 简码（如 `zh`、`en`）或中文别名（如 `中文`、`英语`）。

### 翻译速度慢 / Slow translation speed

NLLB-200 在 CPU 上运行，翻译速度取决于你的硬件。长文本会被自动分块处理，每块约 2-3 秒。

</details>

<details>
<summary><strong>常见问题 / FAQ</strong></summary>

**这真的私密吗？ / Is this really private?**
是的。在模型下载之后，没有任何数据离开你的机器。可用网络监控验证。
Yes. After model download, nothing leaves your machine. Verify with network monitoring.

**可以离线使用吗？ / Can I use this offline?**
可以，只要 NLLB-200 模型已缓存到本地。
Yes, after the NLLB-200 model is cached locally.

**与 Google Translate / DeepL 相比如何？ / How does this compare to Google Translate / DeepL?**
云端服务翻译质量更高（更大模型、更多训练数据），但需要将数据发送到外部。这个工具用一些质量换取完全隐私和零成本。
Cloud services offer higher quality (larger models, more training data) but require sending data externally. This trades some quality for total privacy and zero cost.

**支持哪些语言？ / What languages are supported?**
NLLB-200 支持 200+ 种语言。运行 `list_languages` 查看完整列表。
NLLB-200 supports 200+ languages. Run `list_languages` for the full list.

**支持方言吗？ / Are dialects supported?**
NLLB-200 覆盖部分方言变体（如巴西葡萄牙语 `por_Latn`、拉美西班牙语等），但不像主流语言那样广泛。具体取决于模型训练数据。
NLLB-200 covers some dialectal variants (e.g., Brazilian Portuguese, Latin American Spanish) but not as broadly as major languages. Depends on training data.

**翻译质量怎么样？ / What about translation quality?**
对主流语言对（英↔中、英↔法、英↔西等），600M 蒸馏模型提供不错的翻译质量。对低资源语言，质量会下降——可读但不保证优雅。
For major language pairs (EN↔ZH, EN↔FR, EN↔ES), the 600M distilled model delivers decent quality. For low-resource languages, quality drops — readable but not elegant.

**多用户支持？ / Multi-user support?**
不支持。专为单用户本地访问设计。
No. Designed for single-user, local access.

</details>

<details>
<summary><strong>开发 / Development</strong></summary>

### 从源码构建 / Building from Source

```bash
git clone https://github.com/damoqiongqiu/mcp-local-translate.git
cd mcp-local-translate
pnpm install
```

### 代码质量 / Code Quality

```bash
pnpm run type-check    # TypeScript 检查
pnpm run check:fix     # Lint 和格式化 / Lint and format
pnpm run build         # 编译 / Compile
```

### 项目结构 / Project Structure

```
src/
  index.ts              # 入口点 / Entry point — 路由到 CLI 或 MCP 服务器
  server-main.ts        # MCP 服务器启动 / MCP server startup
  server/
    index.ts            # MCP 工具处理器（translate、list_languages）
    types.ts            # MCP 工具定义
  translator/
    index.ts            # 核心翻译引擎（NLLB-200 管道、分块、懒加载）
    connectivity.ts     # 镜像检测与代理配置
    language-codes.ts   # FLORES-200 语言代码与解析器
  utils/                # 共享工具
skills/                 # 随包发布的 Agent Skills
```

</details>

---

## Agent Skills / Agent Skills

[Agent Skills](https://agentskills.io/) 提供优化的提示词，帮助 AI 助手更有效地使用翻译工具：

```bash
# Claude Code（项目级别 / project-level）
npx @damoqiongqiu/mcp-local-translate skills install --claude-code

# Claude Code（用户级别 / user-level）
npx @damoqiongqiu/mcp-local-translate skills install --claude-code --global

# Codex
npx @damoqiongqiu/mcp-local-translate skills install --codex
```

Skills 包括 / Skills include：
- **语言代码使用 / Language code usage**：FLORES-200、ISO 639-1、中文别名的映射规则
- **长文本翻译 / Long text translation**：自动分块策略和结果解读
- **国内网络配置 / CN network config**：镜像设置和代理配置

---

## 贡献 / Contributing

欢迎贡献！参见 [CONTRIBUTING.md](CONTRIBUTING.md) 了解环境搭建和指南。
Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and guidelines.

## 许可证 / License

MIT License。免费用于个人和商业用途。
MIT License. Free for personal and commercial use.

## 致谢 / Acknowledgments

架构模式参考 [mcp-local-rag](https://github.com/damoqiongqiu/mcp-local-rag) by [Shinsuke Kagawa](https://github.com/shinpr)。使用 [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic 和 [Transformers.js](https://huggingface.co/docs/transformers.js) 构建。翻译模型：[NLLB-200](https://ai.meta.com/research/no-language-left-behind/) by Meta AI。
Architecture patterns inspired by [mcp-local-rag](https://github.com/damoqiongqiu/mcp-local-rag) by [Shinsuke Kagawa](https://github.com/shinpr). Built with [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic and [Transformers.js](https://huggingface.co/docs/transformers.js). Translation model: [NLLB-200](https://ai.meta.com/research/no-language-left-behind/) by Meta AI.
