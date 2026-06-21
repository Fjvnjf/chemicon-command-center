// Single source of truth for bridge URL.
// VPS deployment uses same-origin ('') so `/api/*` is proxied locally.
// GitHub Pages is static-only, so it must call a public HTTPS bridge for live
// Hermes replies. Prefer an explicit browser override, but fall back to the
// currently live HTTPS bridge so GitHub Pages does not hit its own 404 HTML.
// Override any time from the browser console:
//   localStorage.setItem('chemicon.bridgeUrl', 'https://your-stable-bridge.example.com')
//   location.reload()
function cleanBridgeUrl(value: string | null | undefined): string {
  return (value || '').trim().replace(/\/+$/, '')
}

export const DEFAULT_GITHUB_BRIDGE_URL = 'https://generating-ash-appeared-permits.trycloudflare.com'

function detectBridgeUrl(): string {
  if (typeof window === 'undefined') return ''
  const stored = cleanBridgeUrl(window.localStorage?.getItem('chemicon.bridgeUrl'))
  if (stored) return stored
  if (window.location.hostname.includes('github.io')) return DEFAULT_GITHUB_BRIDGE_URL
  return ''
}

export const BRIDGE_URL = detectBridgeUrl()
