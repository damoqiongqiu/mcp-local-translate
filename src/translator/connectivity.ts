// ============================================
// HuggingFace connectivity auto-detection
// ============================================
//
// Same mirror chain as mcp-local-rag:
//   huggingface.co → hf-mirror.com → modelscope.cn
//
// Reused from mcp-local-rag with translation-specific model probes.

// ============================================
// Mirror Configuration
// ============================================

type MirrorUrlStyle = 'hf-hub' | 'modelscope'

export interface MirrorConfig {
  url: string
  pathTemplate: string
  urlStyle: MirrorUrlStyle
}

const MIRROR_CHAIN: readonly MirrorConfig[] = [
  {
    url: 'https://huggingface.co',
    pathTemplate: '{model}/resolve/{revision}/',
    urlStyle: 'hf-hub',
  },
  {
    url: 'https://hf-mirror.com',
    pathTemplate: '{model}/resolve/{revision}/',
    urlStyle: 'hf-hub',
  },
  {
    url: 'https://modelscope.cn',
    pathTemplate: 'api/v1/models/{model}/repo?Revision=master&FilePath=',
    urlStyle: 'modelscope',
  },
]

const DEFAULT_MIRROR_INDEX = 0
const PROBE_TIMEOUT_MS = 3000

// The model we use for API probe checks (lightweight, universally cached)
const PROBE_MODEL = 'Xenova/nllb-200-distilled-600M'
const PROBE_FILE = '/config.json'

// ============================================
// Public API
// ============================================

export interface ResolvedEndpoint {
  endpoint: string
  remotePathTemplate: string
  switched: boolean
  apiComplete: boolean
  logLine: string
}

export async function probeEndpoint(url: string, timeoutMs = PROBE_TIMEOUT_MS): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual',
    })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export async function probeApiEndpoint(
  mirror: MirrorConfig,
  timeoutMs = PROBE_TIMEOUT_MS
): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    if (mirror.urlStyle === 'hf-hub') {
      const apiUrl = `${mirror.url.replace(/\/$/, '')}/api/models/${PROBE_MODEL}`
      const response = await fetch(apiUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) return false
      const contentType = response.headers.get('content-type') || ''
      return contentType.includes('application/json')
    }

    // modelscope: probe via repo API
    const resolvedPath = mirror.pathTemplate
      .replace('{model}', PROBE_MODEL)
      .replace('{revision}', 'master')
      .replace('{file}', PROBE_FILE)
    const testUrl = `${mirror.url.replace(/\/$/, '')}/${resolvedPath}`
    const fixedUrl = testUrl.replace(/(FilePath=)(\/)/g, '$1')
    const response = await fetch(fixedUrl, { method: 'GET', signal: controller.signal })
    return response.ok || response.status === 302
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export async function resolveEndpoint(options: {
  explicitEndpoint?: string
  autoMirror?: boolean
}): Promise<ResolvedEndpoint> {
  const explicit = options.explicitEndpoint
  if (explicit) {
    return {
      endpoint: explicit,
      remotePathTemplate: '{model}/resolve/{revision}/',
      switched: false,
      apiComplete: true,
      logLine: `Using explicit HF_ENDPOINT="${explicit}"`,
    }
  }

  const primary = MIRROR_CHAIN[DEFAULT_MIRROR_INDEX]!
  if (options.autoMirror === false) {
    return {
      endpoint: primary.url,
      remotePathTemplate: primary.pathTemplate,
      switched: false,
      apiComplete: true,
      logLine: `Auto-mirror disabled, using default ${primary.url}`,
    }
  }

  const attempts: string[] = []

  for (const mirror of MIRROR_CHAIN) {
    const reachable = await probeEndpoint(mirror.url)

    if (!reachable) {
      attempts.push(`${mirror.url} (unreachable)`)
      continue
    }

    const apiOk = await probeApiEndpoint(mirror)

    if (!apiOk) {
      const reason =
        mirror.urlStyle === 'modelscope'
          ? 'model not found on ModelScope'
          : 'Hub API (/api/models/) is unavailable'
      attempts.push(`${mirror.url} (reachable but ${reason})`)
      continue
    }

    const logLine =
      mirror === primary
        ? `${mirror.url} is reachable, using as primary`
        : `${primary.url} is unreachable, auto-switching to mirror ${mirror.url}`

    return {
      endpoint: mirror.url,
      remotePathTemplate: mirror.pathTemplate,
      switched: mirror !== primary,
      apiComplete: true,
      logLine,
    }
  }

  const diagnostic =
    attempts.length > 0
      ? [
          `${primary.url} is unreachable. Checked mirrors: ${attempts.join(', ')}.`,
          '',
          'No working endpoint found. Suggestions:',
          '  1. Set HF_ENDPOINT to a full mirror that supports the Hub API',
          '  2. Route traffic through a proxy: export HTTPS_PROXY=http://127.0.0.1:7890',
          '  3. Pre-download models to CACHE_DIR',
          '  4. Set HF_AUTO_MIRROR=false to skip auto-detection',
        ].join('\n')
      : 'All endpoints unreachable. Network may be restricted.'

  return {
    endpoint: primary.url,
    remotePathTemplate: primary.pathTemplate,
    switched: false,
    apiComplete: false,
    logLine: diagnostic,
  }
}

export { MIRROR_CHAIN, PROBE_TIMEOUT_MS }
