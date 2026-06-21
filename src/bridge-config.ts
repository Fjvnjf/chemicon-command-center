// Single source of truth for bridge URL.
// VPS deployment uses same-origin ('') so `/api/*` is proxied locally.
// GitHub Pages is static-only and cannot host the Hermes API itself. To avoid
// depending on fragile Cloudflare tunnel URLs, GitHub builds do not hard-code a
// tunnel. If a stable HTTPS bridge is later added, set it in browser storage:
//   localStorage.setItem('chemicon.bridgeUrl', 'https://your-stable-bridge.example.com')
function cleanBridgeUrl(value: string | null): string {
  return (value || '').trim().replace(/\/+$/, '')
}

export const BRIDGE_URL = typeof window !== 'undefined'
  ? cleanBridgeUrl(window.localStorage?.getItem('chemicon.bridgeUrl'))
  : ''
