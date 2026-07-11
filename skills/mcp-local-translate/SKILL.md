---
name: mcp-local-translate
description: 本地翻译引擎 — 基于 NLLB-200 模型的零依赖翻译工具。支持 200+ 语言，完全离线，数据不出机器。
triggers:
  - 翻译
  - translate
  - 翻成
  - 翻译成
  - 把这段翻译
  - convert to
  - 多语言翻译
  - nllb
  - local translate
  - 本地翻译
---

# mcp-local-translate

> **零依赖、完全本地的 AI 翻译引擎** — 200+ 语言互译，数据从不离开你的电脑。

## 快速开始

```bash
# 直接通过 npx 运行（首次会自动下载模型 ~600MB）
npx @damoqiongqiu/mcp-local-translate
```

在 MCP 客户端配置：

```json
{
  "mcpServers": {
    "mcp-local-translate": {
      "command": "npx",
      "args": ["-y", "@damoqiongqiu/mcp-local-translate"],
      "env": {
        "CACHE_DIR": "./models/"
      }
    }
  }
}
```

## 功能

### 1. 文本翻译 (`translate`)

支持 200+ 语言的互译。语言代码支持：
- **FLORES-200 精确码**：`eng_Latn`、`zho_Hans`、`jpn_Jpan`
- **ISO 639-1 简码**：`en`、`zh`、`ja`、`fr`、`de`
- **中文别名**：`中文`、`英语`、`日语`、`韩语`
- **语言名称**：`English`、`Chinese`、`Japanese`

```
文本 → [NLLB-200 模型] → 翻译结果
```

### 2. 语言列表 (`list_languages`)

查看所有支持的语言，支持关键词搜索。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `CACHE_DIR` | 模型缓存目录 | 系统默认 |
| `HF_ENDPOINT` | HuggingFace 镜像地址（手动指定） | 自动检测 |
| `HF_AUTO_MIRROR` | 自动镜像检测（`0` 关闭） | `1`（开启） |
| `HTTPS_PROXY` | 代理地址 | 无 |
| `TRANSLATE_DEVICE` | 推理设备（`cpu`/`webgpu`） | `cpu` |

## 国内网络注意事项

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

## 技术原理

- **模型**：[Xenova/nllb-200-distilled-600M](https://huggingface.co/Xenova/nllb-200-distilled-600M)
- **引擎**：Transformers.js v4（WebAssembly 推理）
- **规模**：600MB 模型，CPU 即可运行
- **速度**：短文本 <1s，长文本按句分块处理

## 与云端服务的对比

| 特性 | mcp-local-translate | Google Translate API | DeepL API |
|------|---------------------|----------------------|-----------|
| 离线运行 | ✅ | ❌ | ❌ |
| 数据隐私 | ✅ 完全本地 | ❌ 发送到云端 | ❌ 发送到云端 |
| 费用 | 免费 | 按字符计费 | 按字符计费 |
| 语言数量 | 200+ | 130+ | 30+ |
| 翻译质量 | 中等（600M蒸馏模型） | 高 | 高 |
| 速度 | CPU 推理 | 云端 GPU | 云端 GPU |

## 开源

- **GitHub**: [github.com/damoqiongqiu/mcp-local-translate](https://github.com/damoqiongqiu/mcp-local-translate)
- **NPM**: [@damoqiongqiu/mcp-local-translate](https://www.npmjs.com/package/@damoqiongqiu/mcp-local-translate)
- **License**: MIT
