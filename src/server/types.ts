// MCP Tool definitions for mcp-local-translate

import type { Tool } from '@modelcontextprotocol/sdk/types.js'

export const TRANSLATE_TOOL: Tool = {
  name: 'translate',
  description:
    'Translate text between 200+ languages using the NLLB-200 model, running entirely on your local CPU. No cloud APIs, no data leaves your machine.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      text: {
        type: 'string',
        description: 'The text to translate',
      },
      source_lang: {
        type: 'string',
        description:
          'Source language code (FLORES-200, ISO 639-1, or language name). Examples: "eng_Latn", "en", "English", "zho_Hans", "zh", "中文". Use list_languages to see all supported codes.',
      },
      target_lang: {
        type: 'string',
        description:
          'Target language code (FLORES-200, ISO 639-1, or language name). Examples: "zho_Hans", "zh", "中文", "eng_Latn", "en", "English".',
      },
      glossary: {
        type: 'object',
        description:
          'Optional term mapping for consistent translation of domain-specific vocabulary. Keys are source terms, values are their fixed translations. Example: {"Transformer": "transformer", "embedding": "嵌入"}. Terms are replaced with placeholders before translation and restored afterwards.',
      },
    },
    required: ['text', 'source_lang', 'target_lang'],
  },
}

export const TRANSLATE_BATCH_TOOL: Tool = {
  name: 'translate_batch',
  description:
    'Translate multiple texts at once with a single model pipeline invocation. Much faster than calling translate repeatedly for batch workloads. All texts must share the same source and target languages.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      texts: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of text strings to translate',
      },
      source_lang: {
        type: 'string',
        description:
          'Source language code (same format as translate tool). All texts share this source language.',
      },
      target_lang: {
        type: 'string',
        description:
          'Target language code (same format as translate tool). All texts share this target language.',
      },
      glossary: {
        type: 'object',
        description:
          'Optional term mapping applied to all texts in the batch.',
      },
    },
    required: ['texts', 'source_lang', 'target_lang'],
  },
}

export const STATUS_TOOL: Tool = {
  name: 'status',
  description:
    'Check the current status of the translation engine. Returns model readiness, download progress, and endpoint connectivity info. Useful before calling translate to avoid timeouts during model download.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
}

export const LIST_LANGUAGES_TOOL: Tool = {
  name: 'list_languages',
  description:
    'List all 200+ languages supported by the NLLB-200 translation model. Optionally filter/search by keyword.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description:
          'Optional search term to filter languages by name, code, or language family. Leave empty to list all.',
      },
    },
  },
}
