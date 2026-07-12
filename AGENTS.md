# AGENTS.md

为 `mcp-local-translate` 项目工作的 AI 编码 Agent 使用指南。

## 项目概述

mcp-local-translate 是一个本地翻译 MCP 服务器和 CLI 工具 — 基于 Meta NLLB-200 蒸馏模型，支持 200+ 语言互译，完全私有，零配置。通过 Transformers.js 在本地 CPU 上推理（第一次调用时懒加载模型），提供 `translate` 和 `list_languages` 两个 MCP 工具及对应的 CLI 子命令。

- **包名**：npm 上的 `@damoqiongqiu/mcp-local-translate`
- **许可证**：MIT
- **Node 版本**：>= 22
- **包管理器**：pnpm（锁文件：`pnpm-lock.yaml`）
- **语言**：TypeScript 6.0，严格模式，ES Modules（`"type": "module"`）
- **模块系统**：Node16（`"module": "node16"`），相对导入须带 `.js` 扩展名

## 常用命令

```bash
pnpm install              # 安装依赖
pnpm run build            # TypeScript 编译 → dist/
pnpm run dev              # 通过 tsx 运行（无需构建）
pnpm run test             # 运行全部测试
pnpm run type-check       # tsc --noEmit
pnpm run check:fix        # 自动修复 lint 和格式化问题
```

## 项目结构

```
src/
  index.ts              # 入口 — 路由到 CLI 或 MCP 服务器
  server-main.ts        # MCP 服务器启动
  server/
    index.ts            # MCP 工具处理器（translate、list_languages）
    types.ts            # MCP 工具定义
  translator/
    index.ts            # 核心翻译引擎（NLLB-200 管道、文本分块、懒加载、代理配置）
    connectivity.ts     # 镜像检测与代理配置（三级回退：HF → hf-mirror → ModelScope）
    language-codes.ts   # FLORES-200 语言代码映射 + 多级解析器（精确码 → ISO 639-1 → 中文别名）
  utils/                # 共享工具
skills/                 # 随包发布的 Agent Skills
```

## 代码规范

### 格式化（Biome）

- 缩进：2 空格
- 引号：单引号（`'`）
- 分号：无（`"semicolons": "asNeeded"`）
- 尾逗号：ES5（`"trailingCommas": "es5"`）
- 行宽：100
- 自动修复：`pnpm run check:fix`

### Lint 规则

- Biome 推荐规则

### TypeScript 严格模式

全部严格检查均已开启：
- `strict: true`、`noImplicitAny`、`strictNullChecks`、`strictFunctionTypes`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`、`noPropertyAccessFromIndexSignature`、`noImplicitReturns`、`noUnusedLocals`、`noUnusedParameters`

### 导入规范

- 相对导入必须带 `.js` 扩展名（`"module": "node16"` 要求）
- 从具体模块路径导入，不要使用 barrel re-export

## 关键设计决策

### 双接口设计（MCP + CLI）

同一套核心逻辑同时服务于 MCP 工具和 CLI 子命令。入口点（`src/index.ts`）按第一个参数路由：如果匹配已知子命令 → CLI 路径；如果没有参数 → MCP 服务器。CLI 支持相同的环境变量和等价的命令行标志。

### 翻译管道（Translation Pipeline）

`Translator` 类采用懒加载模式 —— 模型在首次调用 `translate()` 时通过 `ensurePipeline()` 初始化，之后复用同一管道。这避免了 MCP 服务器启动时的等待时间。

```ts
class Translator {
  private pipeline: TranslationPipeline | null = null

  async ensurePipeline(): Promise<TranslationPipeline> {
    if (this.pipeline) return this.pipeline
    // 读取 env，配置 mirror/proxy，加载 NLLB-200 模型
    this.pipeline = await pipeline('translation', 'Xenova/nllb-200-distilled-600M', opts)
    return this.pipeline
  }
}
```

### 语言代码解析（Language Code Resolution）

`resolveLanguageCode()` 实现三级回退：
1. 精确 FLORES-200 匹配（`zho_Hans`、`eng_Latn`）
2. ISO 639-1 别名表（`zh` → `zho_Hans`）
3. 中文别名表（`中文` → `zho_Hans`）
4. 模糊搜索（给出最接近的候选项和建议）

### 文本分块（Text Chunking）

长文本在句子边界处分块（正则 `/(?<=[.!?。！？\n])\s+/`），每块最大 450 字符（NLLB 的 token 限制约为 512）。分块翻译后按原始顺序拼接。

### 镜像回退（Mirror Fallback）

`connectivity.ts` 在首次模型下载前自动探测三级镜像链：
`huggingface.co` → `hf-mirror.com` → `modelscope.cn`

同时修复了 ModelScope URL 的 `FilePath=` 参数格式问题（去除前导 `/`）。

### 代理支持（Proxy Support）

通过 `setGlobalDispatcher(new ProxyAgent(...))` 全局设置 HTTP 代理，确保 Node.js 22 所有网络请求都走代理。

## 错误处理

### TypeError in language-codes.ts

`resolveLanguageCode()` 在完全匹配失败时，**不**直接抛出错误，而是返回最接近的候选项和一个 `suggestions` 数组。由上层 handler 决定是否向用户展示建议。

### MCP 客户端边界

每个 handler 使用 try-catch 包裹，捕获异常后转为 MCP 兼容的错误响应。不向客户端暴露堆栈跟踪。

## 核心依赖速查

| 依赖 | 用途 |
|------|------|
| `@huggingface/transformers` | 通过 ONNX 加载 NLLB-200 翻译模型 |
| `@modelcontextprotocol/sdk` | MCP 服务器协议 |
| `undici` | Node.js 22 HTTP 代理（ProxyAgent + setGlobalDispatcher） |

## 提交 PR 之前

**🚨 强制要求 — 不满足以下条件不得提交：**

1. **为新功能写用例测试**：每项新功能必须有对应的测试用例，覆盖正常路径和边界情况
2. **跑回归测试**：确保修改没有破坏已有功能 — 跑完整测试套件：
   ```bash
   pnpm test
   ```
3. **检查通过后提交**：
   ```bash
   pnpm run type-check    # TypeScript 检查
   pnpm run build         # 编译
   pnpm run check:fix     # Lint + 格式化
   ```

同时注意：
- 如果行为有变化，更新文档
- 保持 commit 聚焦 — 每个 PR 一个逻辑变更

## Gitignore 说明

`.gitignore` 排除了 `CLAUDE.md`、`.claude/`、`docs/`、`.workbuddy/` 和 `models/`。本 `AGENTS.md` 文件应纳入版本控制 — 它是项目的 Agent 指令文件。
