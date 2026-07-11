import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  probeEndpoint,
  probeApiEndpoint,
  resolveEndpoint,
  MIRROR_CHAIN,
} from '../connectivity.js'

// Types for MirrorConfig
interface MirrorConfig {
  url: string
  pathTemplate: string
  urlStyle: 'hf-hub' | 'modelscope'
}

describe('connectivity', () => {
  describe('MIRROR_CHAIN', () => {
    it('contains three mirrors in priority order', () => {
      expect(MIRROR_CHAIN).toHaveLength(3)
      expect(MIRROR_CHAIN[0]!.url).toBe('https://huggingface.co')
      expect(MIRROR_CHAIN[1]!.url).toBe('https://hf-mirror.com')
      expect(MIRROR_CHAIN[2]!.url).toBe('https://modelscope.cn')
    })

    it('all mirrors have required fields', () => {
      for (const mirror of MIRROR_CHAIN) {
        expect(mirror).toHaveProperty('url')
        expect(mirror).toHaveProperty('pathTemplate')
        expect(mirror).toHaveProperty('urlStyle')
        expect(['hf-hub', 'modelscope']).toContain(mirror.urlStyle)
      }
    })
  })

  describe('probeEndpoint', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('returns true when host is reachable', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(null, { status: 200 })
      )
      const result = await probeEndpoint('https://example.com')
      expect(result).toBe(true)
    })

    it('returns true even on 4xx responses (host reachable)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(null, { status: 404 })
      )
      const result = await probeEndpoint('https://example.com')
      expect(result).toBe(true)
    })

    it('returns false when fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(
        new Error('connect ECONNREFUSED')
      )
      const result = await probeEndpoint('https://unreachable.example.com')
      expect(result).toBe(false)
    })

    it('times out after default period', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementationOnce(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            // When the AbortController fires, reject with AbortError
            const signal = init?.signal
            if (signal) {
              signal.addEventListener('abort', () =>
                reject(new DOMException('The operation was aborted.', 'AbortError'))
              )
            }
          })
      )
      const result = await probeEndpoint('https://slow.example.com', 50)
      expect(result).toBe(false)
    })
  })

  describe('resolveEndpoint', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('uses explicit endpoint when set', async () => {
      const result = await resolveEndpoint({
        explicitEndpoint: 'https://custom-mirror.example.com',
      })
      expect(result.endpoint).toBe('https://custom-mirror.example.com')
      expect(result.switched).toBe(false)
      expect(result.apiComplete).toBe(true)
    })

    it('uses default when autoMirror is false', async () => {
      const result = await resolveEndpoint({ autoMirror: false })
      expect(result.endpoint).toBe('https://huggingface.co')
      expect(result.switched).toBe(false)
      expect(result.apiComplete).toBe(true)
    })

    it('selects primary when it is reachable and API works', async () => {
      // Mock: HEAD succeeds
      // Mock: HEAD succeeds
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response(null, { status: 200 })) // HEAD probe
        .mockResolvedValueOnce(
          new Response('{}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        ) // API probe

      const result = await resolveEndpoint({})
      expect(result.endpoint).toBe('https://huggingface.co')
      expect(result.switched).toBe(false)
      expect(result.apiComplete).toBe(true)
    })

    it('falls back to next mirror when primary is unreachable', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockRejectedValueOnce(new Error('unreachable')) // HF HEAD fails
        .mockResolvedValueOnce(new Response(null, { status: 200 })) // hf-mirror HEAD ok
        .mockResolvedValueOnce(
          new Response('{}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        ) // hf-mirror API ok

      const result = await resolveEndpoint({})
      expect(result.endpoint).toBe('https://hf-mirror.com')
      expect(result.switched).toBe(true)
      expect(result.apiComplete).toBe(true)
    })

    it('returns apiComplete=false and diagnostic when all mirrors fail', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new Error('unreachable')
      )

      const result = await resolveEndpoint({})
      expect(result.endpoint).toBe('https://huggingface.co')
      expect(result.apiComplete).toBe(false)
      expect(result.logLine).toContain('unreachable')
    })
  })
})
