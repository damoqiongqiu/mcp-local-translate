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
    },
    required: ['text', 'source_lang', 'target_lang'],
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
