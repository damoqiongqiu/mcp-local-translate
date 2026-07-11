<p align="center">
  <img src="assets/banner.jpg" alt="MCP Local Translate — 跨越语言，无需云。" width="600" />
</p>

# MCP Local Translate

[![GitHub stars](https://img.shields.io/github/stars/damoqiongqiu/mcp-local-translate?style=social)](https://github.com/damoqiongqiu/mcp-local-translate)
[![npm version](https://img.shields.io/npm/v/@damoqiongqiu/mcp-local-translate.svg)](https://www.npmjs.com/package/@damoqiongqiu/mcp-local-translate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-green.svg)](https://registry.modelcontextprotocol.io/)

> 🍴 架构模式参考 [shinpr/mcp-local-rag](https://github.com/shinpr/mcp-local-rag) — 原作者 [Shinsuke Kagawa](https://github.com/shinpr)
>
> AI 编程助手的本地翻译引擎。基于 NLLB-200 模型，支持 200+ 语言互译——完全离线，数据不离开你的机器。为多语言开发、文档阅读、代码注释翻译而生。

---

## 特性

- **200+ 语言互译**：基于 Meta NLLB-200 蒸馏模型（600M 参数），覆盖全球绝大多数语言——从主流语言到低资源语言（藏语、维吾尔语、高棉语等）。

- **完全本地运行**：无需 API Key，无需云服务。NLLB-200 模型在本地 CPU 上通过 Transformers.js 推理。你的数据从不离开你的机器。

- **智能语言解析**：支持 FLORES-200 精确码（`zho_Hans`）、ISO 639-1 简码（`zh`）、语言名称（`Chinese`）、中文别名（`中文`）——自动映射到正确的模型输入。

- **长文本分块翻译**：长文本在句子边界处自动分块（450 字符/块），每块独立翻译后拼接——突破 NLLB 的 512 token 限制。

- **零摩擦上手**：一条 `npx` 命令搞定。无需 Docker、Python、GPU。可通过 MCP 或 CLI 使用。

- **三级镜像回退**：自动探测 HuggingFace → hf-mirror.com → ModelScope 三级镜像链，国内网络环境下自动找到可用的模型下载源。

---

## 快速开始

### 配置 AI 编程工具

**Cursor** — 添加到 `~/.cursor/mcp.json`：

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

**Codex** — 添加到 `~/.codex/config.toml`：

```toml
[mcp_servers.local-translate]
command = "npx"
args = ["-y", "@damoqiongqiu/mcp-local-translate"]

[mcp_servers.local-translate.env]
CACHE_DIR = "/path/to/models"
```

**Claude Code** — 运行以下命令：

```bash
claude mcp add local-translate --scope user --env CACHE_DIR=/path/to/models -- npx -y @damoqiongqiu/mcp-local-translate
```

**WorkBuddy** — 打开「设置 → 自定义连接器 → 添加自定义连接器」：

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

> ⚠️ **首次添加后，必须在「自定义连接器」列表中点击「信任」按钮**，否则 MCP 服务器不会启动。

重启工具后即可使用：

```
你: "把这段文档翻译成中文"
助手: [返回翻译结果]

你: "这段日语注释是什么意思？"
助手: 那是「データベース接続に失敗しました」—— 数据库连接失败。

你: "列出所有支持的翻译语言"
助手: 共 204 种语言，包括 中文、英语、日语、法语、德语...
```

**也可直接作为 CLI 使用——无需启动 MCP 服务器：**

```bash
npx @damoqiongqiu/mcp-local-translate translate "Hello, world!" --source en --target zh
npx @damoqiongqiu/mcp-local-translate list-languages --query "chinese"
```

就这些。无需 Docker，无需 Python，无需配置服务器。

---

## 为什么会有这个项目

你的 AI 编程助手可以帮你写代码，但当你面对非母语的文档、注释、错误日志时，仍然需要跳出编程环境去复制粘贴到在线翻译工具。

**隐私。** 把代码片段或内部文档粘贴到 Google Translate 本质上是数据泄露。这个工具完全在本地运行——没有人能看到你的文本。

**离线可用。** 配置完成后无需联网即可使用——飞机上、咖啡店无 WiFi、空气间隙环境。

**低资源语言。** NLLB-200 覆盖了 Google Translate 和 DeepL 不支持的小语言（如藏语、维吾尔语、高棉语等）。

**成本。** 无需为翻译 API 付费。只需一次模型下载（~600MB），然后无限使用。

---

## 使用方式

mcp-local-translate 提供两种接口：**MCP 服务器**（供 AI 编程工具使用）和 **CLI**（供终端直接使用）。

### 通过 MCP 使用

MCP 服务器提供 2 个工具：`translate` 和 `list_languages`。

#### 翻译文本

```
"把这段 React hooks 文档翻译成中文"
"翻译这个错误信息"
"这段日语注释是什么意思？"
```

`translate` 工具接受：

| 参数 | 类型 | 说明 |
|------|------|------|
| `text` | `string` | 待翻译文本 |
| `source_lang` | `string` | 源语言代码（`auto` 自动检测） |
| `target_lang` | `string` | 目标语言代码 |

语言代码支持三种格式：
- **FLORES-200 精确码**：`zho_Hans`（简体中文）、`eng_Latn`（英语）、`jpn_Jpan`（日语）
- **ISO 639-1 简码**：`zh`、`en`、`ja`、`fr`、`de`
- **中文别名**：`中文`、`英语`、`日语`、`韩语`

#### 查看支持的语言

```
"这个翻译引擎支持多少种语言？"
"看看有没有藏语"
```

使用 `list_languages` 工具，可选 `query` 参数进行关键词过滤。

### 作为 CLI 使用

所有 MCP 工具也可以通过 CLI 命令使用：

```bash
# 翻译文本
npx @damoqiongqiu/mcp-local-translate translate "Hello, world!" --source en --target zh

# 自动检测源语言
npx @damoqiongqiu/mcp-local-translate translate "Bonjour le monde" --source auto --target en

# 查看支持的语言
npx @damoqiongqiu/mcp-local-translate list-languages

# 按关键词过滤
npx @damoqiongqiu/mcp-local-translate list-languages --query "chinese"
```

> ⚠️ CLI **不会**读取你的 MCP 客户端配置。

---

## 工作原理

**简要：**
- 语言代码通过三级解析器（精确码 → 别名 → 模糊匹配）映射到 FLORES-200 格式
- 长文本在句子边界处分块（450 字符/块），每块独立翻译
- 翻译引擎使用 Transformers.js 加载 NLLB-200 蒸馏模型（600M 参数），在本地 ONNX Runtime 上以 CPU 推理
- 结果按原始顺序拼接，保持段落和换行结构

### 详细说明

当你调用 `translate` 时：

1. **语言解析**：输入的语言代码经过三级解析——先尝试精确 FLORES-200 匹配（`zho_Hans`），再查 ISO 639-1 别名表（`zh` → `zho_Hans`），最后查中文别名表（`中文` → `zho_Hans`）。如果全部失败，进行模糊搜索并给出建议。

2. **文本预处理**：超长文本（>450 字符）在句子边界处拆分（正则 `/(?<=[.!?。！？\n])\s+/`），确保不截断到句子中间。每块加上源语言和目标语言标记。

3. **模型推理**：每块通过 NLLB-200 蒸馏模型（`Xenova/nllb-200-distilled-600M`）翻译。模型通过懒加载初始化——首次翻译时下载并加载到内存，后续调用复用同一管道。

4. **结果拼接**：翻译结果按原始块顺序拼接，标记之间的段落和换行得以保留。

---

## 配置

### 环境变量

MCP 服务器仅通过环境变量配置——通过 MCP 客户端的 `env` 块传入。

| 环境变量 | 默认值 | 描述 |
|----------|--------|------|
| `CACHE_DIR` | 系统默认 | 模型缓存目录。NLLB-200 模型（~600MB）自动下载到此。建议使用绝对路径。 |
| `HF_ENDPOINT` | `https://huggingface.co` | HuggingFace 镜像端点。设置后跳过自动镜像检测。 |
| `HF_AUTO_MIRROR` | `true` | 自动镜像检测开关。设为 `false` 禁用。默认开启，自动探测三级镜像链。 |
| `HTTPS_PROXY` | （未设置） | HTTP 代理地址，用于下载模型（如 `http://127.0.0.1:7890`）。 |
| `TRANSLATE_DEVICE` | `cpu` | 推理设备。目前仅推荐 `cpu`。 |

---

## 国内网络配置

在中国大陆使用，模型镜像自动检测机制会按优先级尝试：

1. `huggingface.co` — 直连（需要代理或 VPN）
2. `hf-mirror.com` — 国内镜像站
3. `modelscope.cn` — 魔搭社区镜像

如果自动检测失败，手动指定镜像：

```bash
export HF_ENDPOINT=https://hf-mirror.com
```

或配置代理：

```bash
export HTTPS_PROXY=http://127.0.0.1:7890
```

---

## 对比云端服务

| 特性 | mcp-local-translate | Google Translate API | DeepL API |
|------|---------------------|----------------------|-----------|
| 离线运行 | ✅ | ❌ | ❌ |
| 数据隐私 | ✅ 完全本地 | ❌ 发送到云端 | ❌ 发送到云端 |
| 费用 | 免费 | 按字符计费 | 按字符计费 |
| 语言数量 | 200+ | 130+ | 30+ |
| 翻译质量 | 中等（600M蒸馏模型） | 高 | 高 |
| 速度 | CPU 推理 | 云端 GPU | 云端 GPU |

---

## 许可证

MIT License。免费用于个人和商业用途。

## 贡献

欢迎贡献！参见 [CONTRIBUTING.md](CONTRIBUTING.md) 了解环境搭建和指南。

## 致谢

架构模式参考 [mcp-local-rag](https://github.com/damoqiongqiu/mcp-local-rag) by [Shinsuke Kagawa](https://github.com/shinpr)。使用 [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic 和 [Transformers.js](https://huggingface.co/docs/transformers.js) 构建。翻译模型：[NLLB-200](https://ai.meta.com/research/no-language-left-behind/) by Meta AI。
