# Contributing to MCP Local Translate

Contributions welcome! This guide covers what you need to get started.

## Prerequisites

- Node.js >= 22
- [pnpm](https://pnpm.io/)

## Setup

```bash
git clone https://github.com/damoqiongqiu/mcp-local-translate.git
cd mcp-local-translate
pnpm install
```

The NLLB-200 translation model (~600MB) downloads on first translate call.

## Quality Checks

Before submitting, run:

```bash
pnpm run type-check    # TypeScript strict mode check
pnpm run build         # Compile TypeScript
pnpm test              # Run tests
pnpm run check:fix     # Auto-fix lint and format issues
```

## PR Requirements

Before submitting a pull request:

1. **Add tests** for new features and bug fixes
2. **Run the quality checks** above and ensure everything passes
3. **Update documentation** if behavior changes
4. **Keep commits focused** — one logical change per PR
5. **Enable "Allow edits from maintainers"** when opening your PR — this lets us push small fixes directly and speeds up the review cycle

## Writing tests

This project uses Vitest for testing. Test files live alongside source under `src/__tests__/`. If a module needs mocking, prefer `vi.doMock` inside `beforeAll` (and clean up in `afterAll`) to avoid leaking mocks to other test files.

## Project Structure

```
src/
  index.ts              # Entry point
  server-main.ts        # MCP server startup
  server/
    index.ts            # MCP tool handlers (translate, list_languages)
    types.ts            # MCP tool definitions
  translator/
    index.ts            # Core translation engine
    connectivity.ts     # Mirror detection and proxy config
    language-codes.ts   # Language code resolver
  utils/                # Shared utilities
skills/                 # Agent Skills bundled with the package
```

## Architecture Notes

- **Lazy loading**: The NLLB-200 model is loaded on first `translate()` call via `ensurePipeline()`, not at server startup. This keeps MCP server launch instant.
- **Language resolution**: `resolveLanguageCode()` in `language-codes.ts` implements a three-tier resolution strategy (exact → alias → fuzzy). When adding new language aliases, follow the existing pattern.
- **Chunked translation**: Long texts are split at sentence boundaries (450 chars/chunk) in `splitText()`. When modifying the splitter, ensure sentence integrity is maintained.
- **Mirror chain**: Connectivity probing in `connectivity.ts` follows the `huggingface.co → hf-mirror.com → modelscope.cn` chain. New mirrors can be added to the `MIRROR_CHAIN` array.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
