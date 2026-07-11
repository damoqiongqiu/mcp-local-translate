# mcp-local-translate v0.1.0 — Initial Release

## 完成摘要

mcp-local-translate 项目的初始版本：基于 NLLB-200 蒸馏模型的本地翻译引擎，通过 MCP 协议集成到 AI 编码助手。完全离线运行，支持 200+ 语言互译。

## 核心实现

### 项目骨架
- TypeScript 6.0 严格模式 + Node.js 22 + pnpm
- MCP 服务器 + CLI 的双接口架构（复用了 mcp-local-rag 的架构模式）
- Biome 代码规范（单引号、无分号、100 行宽）

### 翻译引擎（`src/translator/`）
- `Translator` 类：懒加载 NLLB-200 管道，首次 `translate()` 调用时初始化
- 文本分块：句子边界正则 `/(?<=[.!?。！？\n])\s+/`，每块 450 字符
- `connectivity.ts`：三级镜像回退（HF → hf-mirror → ModelScope）+ 全局代理
- `language-codes.ts`：204 种 FLORES-200 语言 + ISO 639-1 别名 + 中文别名

### MCP 接口（`src/server/`）
- `translate` 工具：文本翻译，支持 `auto` 源语言检测
- `list_languages` 工具：列出支持的语言，可选 `query` 关键词过滤
- 智能语言解析：精确码 → ISO 639-1 → 中文别名 → 模糊搜索 + 建议

### 依赖性
- 运行依赖仅 3 个：`@huggingface/transformers`、`@modelcontextprotocol/sdk`、`undici`
- 无数据库、无外部服务、无 Docker

## 编译状态

- ✅ `tsc --noEmit` 通过（严格模式，0 错误）
- ✅ `tsc` build 通过
- ✅ Biome lint 通过
- ✅ Git 初始化，14 个源文件提交

## 待完成

| # | 项目 | 难度 |
|---|------|------|
| 1 | 测试套件 | 中 |
| 2 | `auto` 语言检测（当前仅标记，未实现实际检测逻辑） | 小 |
| 3 | `.nvmrc` 文件 | 小 |
| 4 | CI/CD 流水线 | 中 |
| 5 | npm 发布脚本 | 小 |
