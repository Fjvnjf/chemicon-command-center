// Single source of truth for bridge URL.
// VPS deployment uses same-origin ('') so `/api/*` is proxied locally.
// GitHub Pages is static-only and must NOT depend on a Cloudflare quick tunnel.
// Live Hermes replies require an explicit stable HTTPS bridge override.
// Override any time from the browser console:
//   localStorage.setItem('chemicon.bridgeUrl', 'https://your-stable-bridge.example.com')
//   location.reload()
function cleanBridgeUrl(value: string | null | undefined): string {
  return (value || '').trim().replace(/\/+$/, '')
}

function isBlockedBridgeUrl(value: string): boolean {
  return /trycloudflare\.com/i.test(value)
}

const GITHUB_LIVE_BRIDGE_URL = 'https://tough-panther-41.loca.lt'

function detectBridgeUrl(): string {
  if (typeof window === 'undefined') return ''
  const stored = cleanBridgeUrl(window.localStorage?.getItem('chemicon.bridgeUrl'))
  if (stored && isBlockedBridgeUrl(stored)) {
    window.localStorage?.removeItem('chemicon.bridgeUrl')
    return ''
  }
  if (stored) return stored

  // GitHub Pages is static hosting, but it can call this non-Cloudflare HTTPS
  // bridge when the matching VPS tunnel/service is online.
  if (window.location.hostname.includes('github.io')) return GITHUB_LIVE_BRIDGE_URL
  return ''
}

export const BRIDGE_URL = detectBridgeUrl()

// localtunnel returns an HTML confirmation page to browser-origin traffic unless
// this header is present. It is harmless for same-origin/VPS bridge calls.
export const BRIDGE_FETCH_HEADERS: Record<string, string> = BRIDGE_URL.includes('loca.lt')
  ? { 'bypass-tunnel-reminder': 'true' }
  : {}
