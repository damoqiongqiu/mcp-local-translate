import { describe, expect, it, vi } from 'vitest'
import { Translator } from '../index.js'

// ============================================
// Helper: access private members for testing
// ============================================

interface CacheAccess {
  get(text: string, src: string, tgt: string): string | null
  set(text: string, src: string, tgt: string, result: string): void
  size: number
  maxSizeLimit: number
}

function getCache(t: Translator): CacheAccess {
  // biome-ignore lint/suspicious/noExplicitAny: testing private internals
  return (t as any)['cache'] as CacheAccess
}

// ============================================
// LRU Cache Tests
// ============================================

describe('LRU Cache', () => {
  it('starts empty', () => {
    const t = new Translator()
    expect(getCache(t).size).toBe(0)
  })

  it('stores and retrieves entries', () => {
    const t = new Translator()
    const cache = getCache(t)
    cache.set('hello', 'en', 'zh', '你好')
    expect(cache.size).toBe(1)
    expect(cache.get('hello', 'en', 'zh')).toBe('你好')
  })

  it('returns null on cache miss', () => {
    const t = new Translator()
    const cache = getCache(t)
    expect(cache.get('missing', 'en', 'zh')).toBeNull()
  })

  it('differentiates by language pair', () => {
    const t = new Translator()
    const cache = getCache(t)
    cache.set('hello', 'en', 'zh', '你好')
    cache.set('hello', 'en', 'ja', 'こんにちは')
    expect(cache.get('hello', 'en', 'zh')).toBe('你好')
    expect(cache.get('hello', 'en', 'ja')).toBe('こんにちは')
    expect(cache.size).toBe(2)
  })

  it('evicts oldest entry at capacity', () => {
    const t = new Translator({ maxCacheSize: 2 })
    const cache = getCache(t)
    cache.set('first', 'en', 'zh', '第一')
    cache.set('second', 'en', 'zh', '第二')
    // Cache is full, oldest (first) should be evicted
    cache.set('third', 'en', 'zh', '第三')
    expect(cache.size).toBe(2)
    expect(cache.get('first', 'en', 'zh')).toBeNull()
    expect(cache.get('second', 'en', 'zh')).toBe('第二')
    expect(cache.get('third', 'en', 'zh')).toBe('第三')
  })

  it('moves accessed entry to most-recently-used', () => {
    const t = new Translator({ maxCacheSize: 2 })
    const cache = getCache(t)
    cache.set('first', 'en', 'zh', '第一')
    cache.set('second', 'en', 'zh', '第二')
    // Access first → moves it to end (MRU), second becomes LRU
    cache.get('first', 'en', 'zh')
    cache.set('third', 'en', 'zh', '第三')
    // second should be evicted, first should survive
    expect(cache.size).toBe(2)
    expect(cache.get('second', 'en', 'zh')).toBeNull()
    expect(cache.get('first', 'en', 'zh')).toBe('第一')
    expect(cache.get('third', 'en', 'zh')).toBe('第三')
  })

  it('overwrites existing entry for same key', () => {
    const t = new Translator()
    const cache = getCache(t)
    cache.set('hello', 'en', 'zh', '你好')
    cache.set('hello', 'en', 'zh', '您好')
    expect(cache.size).toBe(1)
    expect(cache.get('hello', 'en', 'zh')).toBe('您好')
  })

  it('respects custom maxCacheSize', () => {
    const t = new Translator({ maxCacheSize: 5 })
    const cache = getCache(t)
    expect(cache.maxSizeLimit).toBe(5)
    // Fill to capacity + 1
    for (let i = 0; i < 10; i++) {
      cache.set(`text${i}`, 'en', 'zh', `翻译${i}`)
    }
    expect(cache.size).toBe(5)
    // First 5 should be evicted
    expect(cache.get('text0', 'en', 'zh')).toBeNull()
    expect(cache.get('text4', 'en', 'zh')).toBeNull()
    // Last 5 should survive
    expect(cache.get('text9', 'en', 'zh')).toBe('翻译9')
  })
})

// ============================================
// Glossary Tests
// ============================================

describe('Glossary', () => {
  function makeTranslator() {
    const t = new Translator({ maxCacheSize: 10 })
    // Mock ensurePipeline: skip real model loading
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['ensurePipeline'] = vi.fn().mockResolvedValue(undefined)
    return t
  }

  it('injects and restores single glossary term', async () => {
    const t = makeTranslator()
    // Pass-through: return input as-is so placeholders come back verbatim
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['translateSingle'] = vi.fn().mockResolvedValue('[GLO0] uses attention mechanisms.')

    const result = await t.translate({
      text: 'Transformer uses attention mechanisms.',
      sourceLang: 'en',
      targetLang: 'zh',
      glossary: { Transformer: 'Transformer模型' },
    })

    expect(result.translatedText).toBe('Transformer模型 uses attention mechanisms.')
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('injects and restores multiple glossary terms', async () => {
    const t = makeTranslator()
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['translateSingle'] = vi
      .fn()
      .mockResolvedValue('[GLO0] uses [GLO1] to process [GLO2] data.')

    const result = await t.translate({
      text: 'The Transformer uses self-attention to process sequential data.',
      sourceLang: 'en',
      targetLang: 'zh',
      glossary: {
        Transformer: 'Transformer模型',
        'self-attention': '自注意力',
        sequential: '序列',
      },
    })

    expect(result.translatedText).toBe('Transformer模型 uses 自注意力 to process 序列 data.')
  })

  it('fuzzy fallback restores mangled placeholders', async () => {
    const t = makeTranslator()
    // Simulate tokenizer mangling: [GLO0] → [ GLO0] (added space)
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['translateSingle'] = vi.fn().mockResolvedValue('The [GLO0 is a key component.')

    const result = await t.translate({
      text: 'The Transformer is a key component.',
      sourceLang: 'en',
      targetLang: 'zh',
      glossary: { Transformer: 'Transformer架构' },
    })

    // Fuzzy fallback should catch [GLO0 (missing closing bracket)
    expect(result.translatedText).toBe('The Transformer架构 is a key component.')
  })

  it('handles regex-special characters in glossary terms', async () => {
    const t = makeTranslator()
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['translateSingle'] = vi.fn().mockResolvedValue('[GLO0] costs $100.')

    const result = await t.translate({
      text: 'C++ costs $100.',
      sourceLang: 'en',
      targetLang: 'zh',
      glossary: { 'C++': 'C++语言' },
    })

    expect(result.translatedText).toBe('C++语言 costs $100.')
  })

  it('works without glossary (no placeholder injection)', async () => {
    const t = makeTranslator()
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['translateSingle'] = vi.fn().mockResolvedValue('Hello world translated.')

    const result = await t.translate({
      text: 'Hello world.',
      sourceLang: 'en',
      targetLang: 'zh',
    })

    expect(result.translatedText).toBe('Hello world translated.')
  })

  it('empty glossary is a no-op', async () => {
    const t = makeTranslator()
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['translateSingle'] = vi.fn().mockResolvedValue('Hello translated.')

    const result = await t.translate({
      text: 'Hello.',
      sourceLang: 'en',
      targetLang: 'zh',
      glossary: {},
    })

    expect(result.translatedText).toBe('Hello translated.')
  })
})

// ============================================
// Batch Translation Tests
// ============================================

describe('Batch Translation', () => {
  function makeTranslator() {
    const t = new Translator({ maxCacheSize: 20 })
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['ensurePipeline'] = vi.fn().mockResolvedValue(undefined)
    return t
  }

  it('translates multiple texts', async () => {
    const t = makeTranslator()
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['translateSingle'] = vi
      .fn()
      .mockResolvedValueOnce('你好')
      .mockResolvedValueOnce('世界')
      .mockResolvedValueOnce('测试')

    const result = await t.translateBatch({
      texts: ['hello', 'world', 'test'],
      sourceLang: 'en',
      targetLang: 'zh',
    })

    expect(result.translations).toHaveLength(3)
    expect(result.translations[0]).toEqual({ text: 'hello', translatedText: '你好' })
    expect(result.translations[1]).toEqual({ text: 'world', translatedText: '世界' })
    expect(result.translations[2]).toEqual({ text: 'test', translatedText: '测试' })
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('handles empty input array', async () => {
    const t = makeTranslator()

    const result = await t.translateBatch({
      texts: [],
      sourceLang: 'en',
      targetLang: 'zh',
    })

    expect(result.translations).toHaveLength(0)
    expect(result.durationMs).toBe(0)
  })

  it('shares glossary across batch', async () => {
    const t = makeTranslator()
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['translateSingle'] = vi
      .fn()
      .mockResolvedValueOnce('[GLO0] is great.') // text 1
      .mockResolvedValueOnce('I love [GLO0].') // text 2

    const result = await t.translateBatch({
      texts: ['AI is great.', 'I love AI.'],
      sourceLang: 'en',
      targetLang: 'zh',
      glossary: { AI: '人工智能' },
    })

    expect(result.translations[0]!.translatedText).toBe('人工智能 is great.')
    expect(result.translations[1]!.translatedText).toBe('I love 人工智能.')
  })
})

// ============================================
// Status Tests
// ============================================

describe('Status', () => {
  it('getStatus returns uninitialized before any translate call', () => {
    const t = new Translator()
    const status = t.getStatus()
    expect(status.state).toBe('uninitialized')
    // cacheStats is only included in 'ready' state
    expect(status.cacheStats).toBeUndefined()
  })

  it('getStatus includes cache statistics when ready', () => {
    const t = new Translator({ maxCacheSize: 100 })
    // Simulate initialized state by setting private fields
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['initialized'] = true
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['endpointInfo'] = { logLine: 'test log' }

    const status = t.getStatus()
    expect(status.state).toBe('ready')
    expect(status.cacheStats).toBeDefined()
    expect(status.cacheStats!.size).toBe(0)
    expect(status.cacheStats!.maxSize).toBe(100)
  })

  it('getStatus reflects cache usage', () => {
    const t = new Translator({ maxCacheSize: 50 })
    // biome-ignore lint/suspicious/noExplicitAny: testing
    const cache = (t as any)['cache']
    cache.set('a', 'en', 'zh', '啊')
    cache.set('b', 'en', 'zh', '吧')
    // Need initialized=true for cacheStats to appear
    // biome-ignore lint/suspicious/noExplicitAny: testing
    ;(t as any)['initialized'] = true

    const status = t.getStatus()
    expect(status.state).toBe('ready')
    expect(status.cacheStats!.size).toBe(2)
    expect(status.cacheStats!.maxSize).toBe(50)
  })

  it('isReady returns false before pipeline load', () => {
    const t = new Translator()
    expect(t.isReady()).toBe(false)
  })

  it('constructor accepts configuration', () => {
    const t = new Translator({
      cacheDir: '/tmp/models',
      device: 'cpu',
      proxyUrl: 'http://proxy:8080',
    })
    expect(t.isReady()).toBe(false)
  })
})
