// ============================================
// NLLB-200 Translation Engine
// ============================================
//
// Uses Transformers.js pipeline with Xenova/nllb-200-distilled-600M.
// The model is ~600M params (~3.5GB on disk) and translates 200+ languages with CPU-only inference.
//
// Features:
//   - Lazy model loading (only on first translate() call)
//   - Proxy-aware fetch for Chinese networks
//   - ModelScope URL fixup for Transformers.js compatibility
//   - Long text chunking (splits at sentence boundaries, parallel translate)
//   - LRU translation cache (same text+lang pairs skip re-translation)
//   - Glossary support for domain-specific terminology
//   - Batch translation for multi-text workloads
//   - Download progress tracking for status reporting

import { env, type PipelineType, type TranslationPipeline } from '@huggingface/transformers'
import { type ResolvedEndpoint, resolveEndpoint } from './connectivity.js'

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
  /** Maximum LRU cache size (default: 1000) */
  maxCacheSize?: number
}

export interface TranslateInput {
  text: string
  sourceLang: string
  targetLang: string
  /** Optional term mapping for glossary-based translation */
  glossary?: Record<string, string>
}

export interface TranslateOutput {
  translatedText: string
  sourceLang: string
  targetLang: string
  /** Time taken in milliseconds */
  durationMs: number
  /** Whether result came from cache */
  fromCache?: boolean
}

export interface BatchTranslateInput {
  texts: string[]
  sourceLang: string
  targetLang: string
  glossary?: Record<string, string>
}

export interface BatchTranslateOutput {
  translations: Array<{
    text: string
    translatedText: string
  }>
  sourceLang: string
  targetLang: string
  durationMs: number
}

export interface TranslationStatus {
  state: 'uninitialized' | 'downloading' | 'ready' | 'error'
  progress?:
    | {
        file?: string | undefined
        pct?: number | undefined
      }
    | undefined
  endpointLog?: string | undefined
  cacheStats?:
    | {
        size: number
        maxSize: number
      }
    | undefined
}

/** Maximum characters per batch chunk (NLLB has ~512 token context window) */
const MAX_CHUNK_LENGTH = 450

/** Sentence boundary regex for smart splitting */
const SENTENCE_BOUNDARY = /(?<=[.!?。！？\n])\s+/

// ============================================
// LRU Cache
// ============================================

interface CacheEntry {
  text: string
  sourceLang: string
  targetLang: string
  result: string
}

class LRUCache {
  private map = new Map<string, CacheEntry>()
  private maxSize: number

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
  }

  private makeKey(text: string, src: string, tgt: string): string {
    return `${src}|${tgt}|${text}`
  }

  get(text: string, src: string, tgt: string): string | null {
    const key = this.makeKey(text, src, tgt)
    const entry = this.map.get(key)
    if (!entry) return null
    // Move to end (most recently used)
    this.map.delete(key)
    this.map.set(key, entry)
    return entry.result
  }

  set(text: string, src: string, tgt: string, result: string): void {
    const key = this.makeKey(text, src, tgt)
    // Evict oldest if at capacity
    if (this.map.size >= this.maxSize) {
      const oldest = this.map.keys().next().value
      if (oldest) this.map.delete(oldest)
    }
    this.map.set(key, { text, sourceLang: src, targetLang: tgt, result })
  }

  get size(): number {
    return this.map.size
  }

  get maxSizeLimit(): number {
    return this.maxSize
  }
}

// ============================================
// Translator Class
// ============================================

export class Translator {
  private pipeline_: TranslationPipeline | null = null
  private config: TranslatorConfig
  private endpointInfo: ResolvedEndpoint | null = null
  private initialized = false
  private cache: LRUCache
  private downloadProgress: { file?: string | undefined; pct?: number | undefined } = {}
  private downloadError: string | null = null

  constructor(config: TranslatorConfig = {}) {
    this.config = config
    this.cache = new LRUCache(config.maxCacheSize ?? 1000)
  }

  /**
   * Lazy-load the translation pipeline.
   * Called automatically on first translate() call.
   */
  private async ensurePipeline(): Promise<TranslationPipeline> {
    if (this.pipeline_) return this.pipeline_

    // ============================================
    // Proxy auto-detection (Node.js 22+ undici compat)
    // ============================================
    //
    // Node.js 22+ uses undici for the global fetch(), which does NOT
    // respect HTTPS_PROXY/HTTP_PROXY env vars. We use
    // setGlobalDispatcher() to make ALL fetch() calls (probes +
    // Transformers.js downloads) route through the proxy automatically.
    //
    // Priority: config.proxyUrl > HTTPS_PROXY > HTTP_PROXY
    const proxyUrl = this.config.proxyUrl || process.env['HTTPS_PROXY'] || process.env['HTTP_PROXY']
    if (proxyUrl) {
      const { ProxyAgent, setGlobalDispatcher } = await import('undici')
      setGlobalDispatcher(new ProxyAgent({ uri: proxyUrl, proxyTunnel: true }))
      console.error(`[mcp-local-translate] Proxy configured: ${proxyUrl}`)
    }

    // --- HuggingFace endpoint resolution (auto-mirror detection) ---
    //
    // Priority:
    //   1. config.hfEndpoint (explicit) → always wins, no auto-detect
    //   2. config.autoMirror=false → use huggingface.co, no auto-detect
    //   3. Auto-detect: walk mirror chain (huggingface.co → hf-mirror → modelscope)
    //
    // Probes use global fetch(), which is now proxy-aware via setGlobalDispatcher.
    const endpointOpts: { explicitEndpoint?: string; autoMirror?: boolean } = {}
    if (this.config.hfEndpoint) endpointOpts.explicitEndpoint = this.config.hfEndpoint
    if (this.config.autoMirror !== undefined) endpointOpts.autoMirror = this.config.autoMirror
    this.endpointInfo = await resolveEndpoint(endpointOpts)

    console.error(`[mcp-local-translate] ${this.endpointInfo.logLine}`)

    if (!this.endpointInfo.apiComplete) {
      throw new Error(`Cannot initialize translation model: ${this.endpointInfo.logLine}`)
    }

    // Configure Transformers.js env
    env.allowLocalModels = false
    env.remoteHost = this.endpointInfo.endpoint
    env.remotePathTemplate = this.endpointInfo.remotePathTemplate

    if (this.config.cacheDir) {
      env.cacheDir = this.config.cacheDir
    }

    // ModelScope URL fixup: Transformers.js prepends / to FilePath,
    // but ModelScope needs FilePath without leading /
    const isModelScope = this.endpointInfo.endpoint.includes('modelscope.cn')
    if (isModelScope) {
      const origFetch = env.fetch
      // biome-ignore lint/suspicious/noExplicitAny: fetch init type is complex and varies by platform
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
        progress_callback: (info: {
          status: string
          name?: string
          file?: string
          progress?: number
        }) => {
          if (info.status === 'progress' && info.file) {
            const pct = info.progress ? Math.round(info.progress) : undefined
            this.downloadProgress = { file: info.file, pct }
            console.error(`[mcp-local-translate] Downloading ${info.file} ${pct ?? ''}%`)
          }
        },
      }
    )) as TranslationPipeline

    this.initialized = true
    this.downloadProgress = {}
    console.error('[mcp-local-translate] Model loaded successfully')
    return this.pipeline_
  }

  /**
   * Translate text from source language to target language.
   *
   * For long texts (>MAX_CHUNK_LENGTH chars), splits at sentence boundaries
   * and translates chunks in parallel, then joins.
   * Results are cached via LRU for repeated calls.
   */
  async translate(input: TranslateInput): Promise<TranslateOutput> {
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

    // Check cache
    const cached = this.cache.get(text, srcLang, tgtLang)
    if (cached !== null) {
      return {
        translatedText: cached,
        sourceLang: srcLang,
        targetLang: tgtLang,
        durationMs: 0,
        fromCache: true,
      }
    }

    const startTime = performance.now()
    const pipeline = await this.ensurePipeline()

    // Apply glossary before translation: replace source terms with placeholders
    const glossary = input.glossary ?? {}
    const glossaryEntries = Object.entries(glossary)
    const placeholders = new Map<string, string>() // placeholder → targetTranslation
    let preparedText = text

    if (glossaryEntries.length > 0) {
      let idx = 0
      for (const [sourceTerm, targetTerm] of glossaryEntries) {
        const placeholder = `__GLO${idx}__`
        // Escape special regex chars in the term
        const escaped = sourceTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escaped, 'g')
        preparedText = preparedText.replace(regex, placeholder)
        placeholders.set(placeholder, targetTerm)
        idx++
      }
    }

    // For short texts, translate directly
    if (preparedText.length <= MAX_CHUNK_LENGTH) {
      const result = await this.translateSingle(preparedText, srcLang, tgtLang, pipeline)

      // Restore glossary placeholders in the output
      let finalText = result
      for (const [placeholder, targetTerm] of placeholders) {
        finalText = finalText.replace(new RegExp(placeholder, 'g'), targetTerm)
      }

      const durationMs = Math.round(performance.now() - startTime)
      this.cache.set(text, srcLang, tgtLang, finalText)
      return {
        translatedText: finalText,
        sourceLang: srcLang,
        targetLang: tgtLang,
        durationMs,
      }
    }

    // For long texts, split at sentence boundaries and translate in parallel
    const chunks = this.splitText(preparedText)
    console.error(`[mcp-local-translate] Translating ${chunks.length} chunks in parallel`)

    const translatedChunks = await Promise.all(
      chunks.map(async (chunk, i) => {
        if (!chunk.trim()) return ''
        const translated = await this.translateSingle(chunk, srcLang, tgtLang, pipeline)
        console.error(`[mcp-local-translate] Chunk ${i + 1}/${chunks.length} done`)
        return translated
      })
    )

    let joinedText = translatedChunks.join('\n')

    // Restore glossary placeholders
    for (const [placeholder, targetTerm] of placeholders) {
      joinedText = joinedText.replace(new RegExp(placeholder, 'g'), targetTerm)
    }

    const durationMs = Math.round(performance.now() - startTime)
    console.error(
      `[mcp-local-translate] Translation complete in ${durationMs}ms (${chunks.length} chunks parallel)`
    )

    this.cache.set(text, srcLang, tgtLang, joinedText)
    return {
      translatedText: joinedText,
      sourceLang: srcLang,
      targetLang: tgtLang,
      durationMs,
    }
  }

  /**
   * Batch translate multiple texts sharing the same source/target languages.
   * Reuses a single pipeline load and cache for maximum throughput.
   */
  async translateBatch(input: BatchTranslateInput): Promise<BatchTranslateOutput> {
    const { texts, sourceLang, targetLang, glossary } = input
    const srcLang = sourceLang.trim()
    const tgtLang = targetLang.trim()

    if (texts.length === 0) {
      return {
        translations: [],
        sourceLang: srcLang,
        targetLang: tgtLang,
        durationMs: 0,
      }
    }

    const startTime = performance.now()

    // Translate each text (individual results get cached too)
    const results = await Promise.all(
      texts.map(async (t) => {
        const input: TranslateInput = {
          text: t,
          sourceLang: srcLang,
          targetLang: tgtLang,
        }
        if (glossary) input.glossary = glossary
        const result = await this.translate(input)
        return { text: t, translatedText: result.translatedText }
      })
    )

    const durationMs = Math.round(performance.now() - startTime)
    return {
      translations: results,
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
   * Get current translation engine status.
   */
  getStatus(): TranslationStatus {
    if (this.initialized) {
      return {
        state: 'ready',
        endpointLog: this.endpointInfo?.logLine,
        cacheStats: {
          size: this.cache.size,
          maxSize: this.cache.maxSizeLimit,
        },
      }
    }

    if (this.downloadError) {
      return {
        state: 'error',
        endpointLog: this.downloadError,
      }
    }

    if (Object.keys(this.downloadProgress).length > 0) {
      return {
        state: 'downloading',
        progress: { ...this.downloadProgress },
        endpointLog: this.endpointInfo?.logLine,
      }
    }

    return {
      state: 'uninitialized',
    }
  }

  /**
   * Check if the model is initialized and ready.
   */
  isReady(): boolean {
    return this.initialized
  }
}
