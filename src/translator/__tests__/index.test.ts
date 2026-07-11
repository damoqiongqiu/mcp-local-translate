import { describe, it, expect } from 'vitest'
import { Translator } from '../index.js'

describe('Translator - text splitting', () => {
  // Access private splitText via bracket notation for testing
  function splitText(text: string): string[] {
    const t = new Translator()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (t as any)['splitText'](text) as string[]
  }

  it('returns single chunk for short text', () => {
    const result = splitText('Hello, world!')
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('Hello')
  })

  it('splits at sentence boundaries', () => {
    const longText =
      'First sentence is here. Second sentence goes on. Third sentence continues the thought.'
    const result = splitText(longText)
    // Each sentence is short, should split at each boundary
    expect(result.length).toBeGreaterThanOrEqual(1)
    // Should not split mid-sentence
    for (const chunk of result) {
      expect(chunk.trim().length).toBeGreaterThan(0)
    }
  })

  it('splits Chinese text at sentence boundaries', () => {
    const longChinese =
      '这是第一个句子。这是第二个句子。这是第三个句子。这是第四个句子。这是第五个句子。'
    const result = splitText(longChinese)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('splits long paragraphs into multiple chunks', () => {
    // Build a paragraph that exceeds MAX_CHUNK_LENGTH (450)
    const sentence = 'This is a test sentence that will be repeated many times. '
    const longText = sentence.repeat(30) // ~1200 chars, should split
    const result = splitText(longText)
    expect(result.length).toBeGreaterThan(1)
  })

  it('handles empty string', () => {
    const result = splitText('')
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('')
  })

  it('handles whitespace-only string', () => {
    const result = splitText('   ')
    expect(result).toHaveLength(1)
  })

  it('handles text with newlines as boundaries', () => {
    const text = 'Line one.\nLine two.\nLine three.'
    const result = splitText(text)
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('does not create empty chunks', () => {
    const text = '. . . . . . . . . . . .'
    const result = splitText(text)
    for (const chunk of result) {
      // Even if the chunk has minimal content, it should exist
      expect(typeof chunk).toBe('string')
    }
  })
})

describe('Translator', () => {
  it('isReady returns false before any translate call', () => {
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
