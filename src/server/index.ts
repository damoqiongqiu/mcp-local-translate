// ============================================
// MCP Server for mcp-local-translate
// ============================================

import { createRequire } from 'node:module'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  type CallToolRequest,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { Translator, type TranslatorConfig } from '../translator/index.js'
import {
  formatCandidates,
  getAllLanguages,
  resolveLanguageCode,
  searchLanguage,
} from '../translator/language-codes.js'
import { detectLanguage } from '../translator/language-detect.js'
import { LIST_LANGUAGES_TOOL, STATUS_TOOL, TRANSLATE_BATCH_TOOL, TRANSLATE_TOOL } from './types.js'

// Read version from package.json (works in both dev and dist)
const require = createRequire(import.meta.url)
const pkg = require('../../package.json') as { version: string }

// ============================================
// TranslateServer
// ============================================

export class TranslateServer {
  private server: Server
  private translator: Translator

  constructor(config: TranslatorConfig = {}) {
    this.translator = new Translator(config)

    this.server = new Server(
      {
        name: 'mcp-local-translate',
        version: pkg.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    )

    this.setupHandlers()
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [TRANSLATE_TOOL, TRANSLATE_BATCH_TOOL, STATUS_TOOL, LIST_LANGUAGES_TOOL],
    }))

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'translate://status',
          name: 'Translation Engine Status',
          description: 'Current status of the local translation engine (ready/downloading/error)',
          mimeType: 'application/json',
        },
      ],
    }))

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri

      if (uri === 'translate://status') {
        const status = this.translator.getStatus()
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(status, null, 2),
            },
          ],
        }
      }

      // Dynamic translation resource: translate://{sourceLang}%E2%86%92{targetLang}?text={text}
      const match = uri.match(/^translate:\/\/(.+?)%E2%86%92(.+?)\?text=(.+)$/)
      if (match?.[1] && match[2] && match[3]) {
        const [, srcRaw, tgtRaw, encodedText] = match
        const text = decodeURIComponent(encodedText)
        const sourceLang = resolveLanguageCode(decodeURIComponent(srcRaw))
        const targetLang = resolveLanguageCode(decodeURIComponent(tgtRaw))
        if (!sourceLang || !targetLang) {
          throw new Error('Invalid language code in resource URI')
        }
        const result = await this.translator.translate({ text, sourceLang, targetLang })
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: result.translatedText,
            },
          ],
        }
      }

      throw new Error(`Unknown resource: ${uri}`)
    })

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params

      switch (name) {
        case 'translate':
          return this.handleTranslate(args ?? {})
        case 'translate_batch':
          return this.handleTranslateBatch(args ?? {})
        case 'status':
          return this.handleStatus()
        case 'list_languages':
          return this.handleListLanguages(args ?? {})
        default:
          return {
            content: [
              {
                type: 'text' as const,
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          }
      }
    })
  }

  /**
   * Handle the translate tool call.
   */
  private async handleTranslate(args: Record<string, unknown>): Promise<{
    content: Array<{ type: 'text'; text: string }>
  }> {
    const text = typeof args['text'] === 'string' ? args['text'].trim() : ''
    const sourceLangRaw = typeof args['source_lang'] === 'string' ? args['source_lang'].trim() : ''
    const targetLangRaw = typeof args['target_lang'] === 'string' ? args['target_lang'].trim() : ''
    const glossary =
      typeof args['glossary'] === 'object' && args['glossary'] !== null
        ? (args['glossary'] as Record<string, string>)
        : undefined

    // Validate inputs
    if (!text) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: "text" parameter is required and must not be empty.',
          },
        ],
      }
    }

    if (!sourceLangRaw || !targetLangRaw) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: both "source_lang" and "target_lang" parameters are required.',
          },
        ],
      }
    }

    // Resolve language codes (handle "auto" detection)
    let sourceLang: string | undefined
    if (sourceLangRaw.toLowerCase() === 'auto') {
      const detected = detectLanguage(text)
      if (!detected) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Could not auto-detect source language. The text may be too short or in an unsupported language. Please specify source_lang explicitly (e.g., "eng_Latn", "en", "English"). Use list_languages to see all supported languages.',
            },
          ],
        }
      }
      sourceLang = detected
      console.error(`[mcp-local-translate] Auto-detected source language: ${detected}`)
    } else {
      sourceLang = resolveLanguageCode(sourceLangRaw)
    }
    if (!sourceLang) {
      const candidates = searchLanguage(sourceLangRaw)
      return {
        content: [
          {
            type: 'text',
            text: `Error: Could not resolve source language "${sourceLangRaw}".\n\n${candidates.length > 0 ? `Did you mean one of these?\n${formatCandidates(candidates.slice(0, 10))}\n\n` : ''}Use list_languages to see all supported languages.`,
          },
        ],
      }
    }

    const targetLang = resolveLanguageCode(targetLangRaw)
    if (!targetLang) {
      const candidates = searchLanguage(targetLangRaw)
      return {
        content: [
          {
            type: 'text',
            text: `Error: Could not resolve target language "${targetLangRaw}".\n\n${candidates.length > 0 ? `Did you mean one of these?\n${formatCandidates(candidates.slice(0, 10))}\n\n` : ''}Use list_languages to see all supported languages.`,
          },
        ],
      }
    }

    // Translate
    try {
      const input: Parameters<typeof this.translator.translate>[0] = {
        text,
        sourceLang,
        targetLang,
      }
      if (glossary) input.glossary = glossary

      const result = await this.translator.translate(input)

      const lines = [
        `Source (${result.sourceLang}): ${text}`,
        `Target (${result.targetLang}): ${result.translatedText}`,
        '',
        `Duration: ${result.durationMs}ms${result.fromCache ? ' (cached)' : ''}`,
      ]

      if (glossary && Object.keys(glossary).length > 0) {
        lines.push(`Glossary: ${Object.keys(glossary).length} term(s) applied`)
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: 'text',
            text: `Translation failed: ${errorMessage}`,
          },
        ],
      }
    }
  }

  /**
   * Handle the translate_batch tool call.
   */
  private async handleTranslateBatch(args: Record<string, unknown>): Promise<{
    content: Array<{ type: 'text'; text: string }>
  }> {
    const texts = Array.isArray(args['texts']) ? args['texts'] : []
    const sourceLangRaw = typeof args['source_lang'] === 'string' ? args['source_lang'].trim() : ''
    const targetLangRaw = typeof args['target_lang'] === 'string' ? args['target_lang'].trim() : ''
    const glossary =
      typeof args['glossary'] === 'object' && args['glossary'] !== null
        ? (args['glossary'] as Record<string, string>)
        : undefined

    if (texts.length === 0) {
      return {
        content: [
          { type: 'text', text: 'Error: "texts" array is required and must not be empty.' },
        ],
      }
    }

    if (!sourceLangRaw || !targetLangRaw) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: both "source_lang" and "target_lang" parameters are required.',
          },
        ],
      }
    }

    const sourceLang = resolveLanguageCode(sourceLangRaw)
    if (!sourceLang) {
      return {
        content: [
          { type: 'text', text: `Error: Could not resolve source language "${sourceLangRaw}".` },
        ],
      }
    }

    const targetLang = resolveLanguageCode(targetLangRaw)
    if (!targetLang) {
      return {
        content: [
          { type: 'text', text: `Error: Could not resolve target language "${targetLangRaw}".` },
        ],
      }
    }

    try {
      const input: Parameters<typeof this.translator.translateBatch>[0] = {
        texts: texts.map(String),
        sourceLang,
        targetLang,
      }
      if (glossary) input.glossary = glossary

      const result = await this.translator.translateBatch(input)

      const lines = [
        `Batch translation: ${result.translations.length} text(s)`,
        `Source: ${result.sourceLang} → Target: ${result.targetLang}`,
        `Total duration: ${result.durationMs}ms`,
        '',
      ]

      for (const t of result.translations) {
        lines.push(`  "${t.text}" → "${t.translatedText}"`)
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        content: [{ type: 'text', text: `Batch translation failed: ${errorMessage}` }],
      }
    }
  }

  /**
   * Handle the status tool call.
   */
  private handleStatus(): {
    content: Array<{ type: 'text'; text: string }>
  } {
    const status = this.translator.getStatus()
    const lines = [`Translation Engine Status: ${status.state}`]

    if (status.progress?.file) {
      const pct = status.progress.pct !== undefined ? ` (${status.progress.pct}%)` : ''
      lines.push(`Download: ${status.progress.file}${pct}`)
    }

    if (status.endpointLog) {
      lines.push(`Endpoint: ${status.endpointLog}`)
    }

    if (status.cacheStats) {
      lines.push(`Cache: ${status.cacheStats.size}/${status.cacheStats.maxSize} entries`)
    }

    return {
      content: [{ type: 'text', text: lines.join('\n') }],
    }
  }

  /**
   * Handle the list_languages tool call.
   */
  private handleListLanguages(args: Record<string, unknown>): {
    content: Array<{ type: 'text'; text: string }>
  } {
    const query = typeof args['query'] === 'string' ? args['query'].trim() : ''

    let languages = getAllLanguages()

    if (query) {
      languages = searchLanguage(query)
      if (languages.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No languages found matching "${query}".\n\nUse list_languages without a query to see all ${getAllLanguages().length} supported languages.`,
            },
          ],
        }
      }
    }

    const header = query
      ? `Found ${languages.length} language(s) matching "${query}":`
      : `All ${languages.length} supported languages:`

    const lines = [header, '']

    for (const lang of languages) {
      lines.push(`  ${lang.code} — ${lang.name} (${lang.family})`)
    }

    return {
      content: [{ type: 'text', text: lines.join('\n') }],
    }
  }

  /**
   * Start the MCP server via stdio transport.
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
  }
}
