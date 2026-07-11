// MCP Server startup — reads configuration from environment variables.

import { TranslateServer } from './server/index.js'
import type { TranslatorConfig } from './translator/index.js'

/**
 * Build TranslatorConfig from environment variables.
 *
 * Env vars:
 *   HF_ENDPOINT    — HuggingFace endpoint override
 *   HF_AUTO_MIRROR — Set to "0"/"false" to disable auto-mirror detection
 *   CACHE_DIR      — Model cache directory
 *   HTTPS_PROXY    — Proxy URL for model downloads (also HTTP_PROXY, lowercase)
 *   TRANSLATE_DEVICE — Device type: "cpu" (default) or "webgpu"
 */
function resolveConfig(): TranslatorConfig {
  const config: TranslatorConfig = {}

  const hfEndpoint = process.env['HF_ENDPOINT']
  if (hfEndpoint && hfEndpoint.length > 0) {
    config.hfEndpoint = hfEndpoint
  }

  const autoMirrorEnv = process.env['HF_AUTO_MIRROR']
  if (autoMirrorEnv !== undefined) {
    const lower = autoMirrorEnv.toLowerCase()
    config.autoMirror = lower !== '0' && lower !== 'false'
  }

  const cacheDir = process.env['CACHE_DIR']
  if (cacheDir && cacheDir.length > 0) {
    config.cacheDir = cacheDir
  }

  // Proxy detection: HTTPS_PROXY > HTTP_PROXY > lowercase variants
  const proxyUrl =
    process.env['HTTPS_PROXY'] ??
    process.env['HTTP_PROXY'] ??
    process.env['https_proxy'] ??
    process.env['http_proxy']
  if (proxyUrl && proxyUrl.length > 0) {
    config.proxyUrl = proxyUrl
  }

  const device = process.env['TRANSLATE_DEVICE']
  if (device && device.length > 0) {
    config.device = device.toLowerCase()
  }

  return config
}

/**
 * Start the translation MCP server.
 */
export async function startServer(): Promise<void> {
  try {
    const config = resolveConfig()

    console.error('Starting mcp-local-translate server...')
    console.error('Configuration:', {
      hfEndpoint: config.hfEndpoint ?? '(auto-detect)',
      cacheDir: config.cacheDir ?? '(default)',
      device: config.device ?? 'cpu',
      proxy: config.proxyUrl ? 'configured' : 'none',
    })

    const server = new TranslateServer(config)
    await server.run()

    console.error('mcp-local-translate server started successfully')
  } catch (error) {
    console.error('Failed to start mcp-local-translate server:', error)
    process.exit(1)
  }
}
