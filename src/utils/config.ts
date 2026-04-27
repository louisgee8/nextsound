// Spotify Web API configuration
export const SPOTIFY_CLIENT_ID: string | undefined = import.meta.env.VITE_SPOTIFY_CLIENT_ID
// SPOTIFY_CLIENT_SECRET removed from frontend for security - handled by backend proxy

// Spotify Auth endpoints
export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

// Architecture improvement configuration
// Always use backend proxy for security (client secret not exposed in frontend)
export const USE_BACKEND_PROXY = import.meta.env.VITE_USE_BACKEND_PROXY !== 'false'
// Empty string default = relative URL = "same origin as the browser is on".
// In Docker compose, the browser is on nginx (port 8080), and nginx proxies
// /api/* to the backend container. Setting VITE_PROXY_SERVER_URL=http://localhost:3001
// is still supported for direct-backend dev runs (vite dev without compose).
export const PROXY_SERVER_URL: string = import.meta.env.VITE_PROXY_SERVER_URL || ''
export const ENABLE_OFFLINE_CACHE = import.meta.env.VITE_ENABLE_OFFLINE_CACHE === 'true'
export const API_RETRY_ENABLED = import.meta.env.VITE_API_RETRY_ENABLED === 'true'

// Dynamic API URLs based on proxy configuration
export const SPOTIFY_API_BASE_URL = USE_BACKEND_PROXY
  ? `${PROXY_SERVER_URL}/api/spotify`
  : 'https://api.spotify.com/v1'

export const THROTTLE_DELAY = 150

// Supabase configuration
export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || 'https://uslwkrdsnixifauxuqgo.supabase.co'
export const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzbHdrcmRzbml4aWZhdXh1cWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDUwOTUsImV4cCI6MjA3NjMyMTA5NX0.RhQP6dogPyXYXA7zRUwIX1xJNB7jjNwSZ_MqULtKTxs'
