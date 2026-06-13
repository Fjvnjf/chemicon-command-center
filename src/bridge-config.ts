// Single source of truth for bridge URL
// Auto-detects: relative on VPS (same-origin, no CORS), absolute on GitHub Pages
export const BRIDGE_URL = typeof window !== 'undefined' && window.location.hostname.includes('github.io')
  ? 'https://salon-brisbane-refused-tennis.trycloudflare.com'
  : ''
