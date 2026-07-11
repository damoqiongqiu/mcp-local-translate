// ============================================
// NLLB-200 Translation Engine
// ============================================
//
// Uses Transformers.js pipeline with Xenova/nllb-200-distilled-600M.
// The model is ~600MB and translates 200+ languages with CPU-only inference.
//
// Features:
//   - Lazy model loading (only on first translate() call)
//   - Proxy-aware fetch for Chinese networks
//   - ModelScope URL fixup for Transformers.js compatibility
//   - Long text chunking (splits at sentence boundaries, batch translate)

import { env, type TranslationPipeline, type PipelineType } from '@huggingface/transformers'
import { resolveEndpoint, type ResolvedEndpoint } from './connectivity.js'

// ============================================
// Types
// ============================================

export interface TranslatorConfig {
  /** HuggingFace endpoint override */
  hfEndpoint?: string
  /** Auto-mirror detection toggle */
  autoMirror?: boolean
  /** Cache directory for downloaded models */
  cacheDir?: string
  /** Proxy URL (for networks that need it) */
  proxyUrl?: string
  /** Device type ('cpu' or 'webgpu') */
  device?: string
}

export interface TranslateInput {
  text: string
  sourceLang: string
  targetLang: string
}

export interface TranslateOutput {
  translatedText: string
  sourceLang: string
  targetLang: string
  /** Time taken in milliseconds */
  durationMs: number
}

/** Maximum characters per batch chunk (NLLB has ~512 token context window) */
const MAX_CHUNK_LENGTH = 450

/** Sentence boundary regex for smart splitting */
const SENTENCE_BOUNDARY = /(?<=[.!?。！？\n])\s+/

// ============================================
// Translator Class
// ============================================

export class Translator {
  private pipeline_: TranslationPipeline | null = null
  private config: TranslatorConfig
  private endpointInfo: ResolvedEndpoint | null = null
  private initialized = false

  constructor(config: TranslatorConfig = {}) {
    this.config = config
  }

  /**
   * Lazy-load the translation pipeline.
   * Called automatically on first translate() call.
   */
  private async ensurePipeline(): Promise<TranslationPipeline> {
    if (this.pipeline_) return this.pipeline_

    // Resolve endpoint (mirror chain auto-detection)
    const endpointOpts: { explicitEndpoint?: string; autoMirror?: boolean } = {}
    if (this.config.hfEndpoint) endpointOpts.explicitEndpoint = this.config.hfEndpoint
    if (this.config.autoMirror !== undefined) endpointOpts.autoMirror = this.config.autoMirror
    this.endpointInfo = await resolveEndpoint(endpointOpts)

    console.error(`[mcp-local-translate] ${this.endpointInfo.logLine}`)

    if (!this.endpointInfo.apiComplete) {
      throw new Error(
        `Cannot initialize translation model: ${this.endpointInfo.logLine}`
      )
    }

    // Configure Transformers.js env
    env.allowLocalModels = false
    env.remoteHost = this.endpointInfo.endpoint
    env.remotePathTemplate = this.endpointInfo.remotePathTemplate

    if (this.config.cacheDir) {
      env.cacheDir = this.config.cacheDir
    }

    // Proxy-aware fetch: if proxy is set, create a custom fetch wrapper
    if (this.config.proxyUrl) {
      // undici is bundled with Node.js 22+
      const { ProxyAgent, setGlobalDispatcher } = await import('undici')
      setGlobalDispatcher(new ProxyAgent(this.config.proxyUrl))
      console.error(`[mcp-local-translate] Proxy configured: ${this.config.proxyUrl}`)
    }

    // ModelScope URL fixup: Transformers.js prepends / to FilePath,
    // but ModelScope needs FilePath without leading /
    const isModelScope = this.endpointInfo.endpoint.includes('modelscope.cn')
    if (isModelScope) {
      const origFetch = env.fetch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      env.fetch = async (url: unknown, init?: any) => {
        let urlStr = typeof url === 'string' ? url : String(url)
        urlStr = urlStr.replace(/(FilePath=)(\/)/g, '$1')
        return origFetch(urlStr, init)
      }
      console.error('[mcp-local-translate] ModelScope fetch fixup active')
    }

    // Configure device
    if (this.config.device) {
      ;(env as Record<string, unknown>)['device'] = this.config.device
    }

    console.error('[mcp-local-translate] Loading translation model...')

    // Dynamically import pipeline to allow fetch configuration first
    const { pipeline: getPipeline } = await import('@huggingface/transformers')
    this.pipeline_ = (await getPipeline(
      'translation' as PipelineType,
      'Xenova/nllb-200-distilled-600M',
      {
        progress_callback: (info: { status: string; name?: string; file?: string; progress?: number }) => {
          if (info.status === 'progress' && info.file) {
            const pct = info.progress ? `${Math.round(info.progress)}%` : ''
            console.error(`[mcp-local-translate] Downloading ${info.file} ${pct}`)
          }
        },
      }
    )) as TranslationPipeline

    this.initialized = true
    console.error('[mcp-local-translate] Model loaded successfully')
    return this.pipeline_
  }

  /**
   * Translate text from source language to target language.
   *
   * For long texts (>MAX_CHUNK_LENGTH chars), splits at sentence boundaries
   * and translates each chunk separately, then joins.
   */
  async translate(input: TranslateInput): Promise<TranslateOutput> {
    const startTime = performance.now()

    const pipeline = await this.ensurePipeline()

    // Normalize language codes
    const srcLang = input.sourceLang.trim()
    const tgtLang = input.targetLang.trim()
    const text = input.text.trim()

    if (!text) {
      return {
        translatedText: '',
        sourceLang: srcLang,
        targetLang: tgtLang,
        durationMs: 0,
      }
    }

    // For short texts, translate directly
    if (text.length <= MAX_CHUNK_LENGTH) {
      const result = await this.translateSingle(text, srcLang, tgtLang, pipeline)
      const durationMs = Math.round(performance.now() - startTime)
      return {
        translatedText: result,
        sourceLang: srcLang,
        targetLang: tgtLang,
        durationMs,
      }
    }

    // For long texts, split at sentence boundaries
    const chunks = this.splitText(text)
    const translatedChunks: string[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!
      if (chunk.trim()) {
        const translated = await this.translateSingle(chunk, srcLang, tgtLang, pipeline)
        translatedChunks.push(translated)
      }
      if (chunks.length > 1) {
        console.error(
          `[mcp-local-translate] Chunk ${i + 1}/${chunks.length} translated`
        )
      }
    }

    const durationMs = Math.round(performance.now() - startTime)
    console.error(
      `[mcp-local-translate] Translation complete in ${durationMs}ms (${chunks.length} chunks)`
    )

    return {
      translatedText: translatedChunks.join('\n'),
      sourceLang: srcLang,
      targetLang: tgtLang,
      durationMs,
    }
  }

  /**
   * Translate a single text chunk.
   */
  private async translateSingle(
    text: string,
    srcLang: string,
    tgtLang: string,
    pipeline: TranslationPipeline
  ): Promise<string> {
    const outputs = await pipeline(text, {
      src_lang: srcLang,
      tgt_lang: tgtLang,
      max_new_tokens: 512,
    })

    // Transformers.js translation pipeline returns { translation_text: string }[]
    if (Array.isArray(outputs) && outputs.length > 0) {
      return outputs.map((o: { translation_text: string }) => o.translation_text).join(' ')
    }

    return String(outputs)
  }

  /**
   * Split text at sentence boundaries for chunked translation.
   * Falls back to character-based splitting if no sentence boundaries found.
   */
  private splitText(text: string): string[] {
    // Try sentence splitting first
    const sentences = text.split(SENTENCE_BOUNDARY)

    const chunks: string[] = []
    let currentChunk = ''

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= MAX_CHUNK_LENGTH) {
        currentChunk += (currentChunk ? ' ' : '') + sentence
      } else {
        if (currentChunk) chunks.push(currentChunk)
        // If a single sentence is too long, split by max length
        if (sentence.length > MAX_CHUNK_LENGTH) {
          for (let i = 0; i < sentence.length; i += MAX_CHUNK_LENGTH) {
            chunks.push(sentence.slice(i, i + MAX_CHUNK_LENGTH))
          }
          currentChunk = ''
        } else {
          currentChunk = sentence
        }
      }
    }

    if (currentChunk) chunks.push(currentChunk)
    return chunks.length > 0 ? chunks : [text]
  }

  /**
   * Check if the model is initialized and ready.
   */
  isReady(): boolean {
    return this.initialized
  }
}
