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

function detectBridgeUrl(): string {
  if (typeof window === 'undefined') return ''
  const stored = cleanBridgeUrl(window.localStorage?.getItem('chemicon.bridgeUrl'))
  if (stored) return stored
  return ''
}

export const BRIDGE_URL = detectBridgeUrl()
