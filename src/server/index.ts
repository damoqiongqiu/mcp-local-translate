// ============================================
// MCP Server for mcp-local-translate
// ============================================

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js'
import { Translator, type TranslatorConfig } from '../translator/index.js'
import {
  resolveLanguageCode,
  searchLanguage,
  formatCandidates,
  getAllLanguages,
} from '../translator/language-codes.js'
import { TRANSLATE_TOOL, LIST_LANGUAGES_TOOL } from './types.js'

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
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    this.setupHandlers()
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [TRANSLATE_TOOL, LIST_LANGUAGES_TOOL],
    }))

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params

      switch (name) {
        case 'translate':
          return this.handleTranslate(args ?? {})
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

    // Resolve language codes
    const sourceLang = resolveLanguageCode(sourceLangRaw)
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
      const result = await this.translator.translate({
        text,
        sourceLang,
        targetLang,
      })

      const responseText = [
        `Source (${result.sourceLang}): ${text}`,
        `Target (${result.targetLang}): ${result.translatedText}`,
        '',
        `Duration: ${result.durationMs}ms`,
      ].join('\n')

      return {
        content: [{ type: 'text', text: responseText }],
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
