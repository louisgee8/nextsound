import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// CORS configuration - allow multiple frontend ports during development
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
    ],
    credentials: true,
  }),
)

// Parse JSON bodies
app.use(express.json())

// Spotify API configuration
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

// Token cache
let tokenCache = {
  token: null,
  expiresAt: 0,
}

// Function to get Spotify access token
const getSpotifyToken = async () => {
  // Check if we have a valid cached token
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured')
  }

  try {
    const response = await axios.post(SPOTIFY_TOKEN_URL, 'grant_type=client_credentials', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
    })

    const data = response.data

    // Cache the token with 5-minute buffer before expiry
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    }

    return data.access_token
  } catch (error) {
    console.error('Failed to get Spotify token:', error.response?.data || error.message)
    throw new Error('Authentication failed')
  }
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'spotify-proxy-server',
  })
})

// Spotify API proxy endpoints
app.use('/api/spotify', async (req, res, next) => {
  try {
    // Get the Spotify API path from the request URL.
    // Use req.path (NOT req.url) so we don't include the query string here —
    // axios will append req.query separately via the `params` config below.
    // Including the query string in BOTH places produced duplicate params and
    // Spotify rejected with 400 Bad Request.
    const spotifyPath = req.path.substring(1) // Remove leading slash
    const spotifyUrl = `${SPOTIFY_API_BASE_URL}/${spotifyPath}`

    console.log(`Proxying request to: ${spotifyUrl}`)
    console.log('Query params:', req.query)

    // Get access token
    const token = await getSpotifyToken()

    // Prepare request configuration
    const config = {
      method: req.method,
      url: spotifyUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: req.query,
      timeout: 10000, // 10 second timeout
    }

    // Add body for non-GET requests
    if (req.method !== 'GET' && req.body) {
      config.data = req.body
    }

    // Make request to Spotify API
    const response = await axios(config)

    // Add cache headers based on endpoint type
    const setCacheHeaders = (path) => {
      if (path.includes('search')) {
        res.set('Cache-Control', 'public, max-age=300') // 5 minutes
      } else if (path.includes('featured-playlists')) {
        res.set('Cache-Control', 'public, max-age=1800') // 30 minutes
      } else if (path.includes('new-releases')) {
        res.set('Cache-Control', 'public, max-age=3600') // 1 hour
      } else if (
        path.includes('tracks/') ||
        path.includes('albums/') ||
        path.includes('artists/')
      ) {
        res.set('Cache-Control', 'public, max-age=86400') // 24 hours
      } else {
        res.set('Cache-Control', 'public, max-age=1800') // 30 minutes default
      }
    }

    setCacheHeaders(spotifyPath)

    // Return the response
    res.status(response.status).json(response.data)
  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message)

    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: {
          status: 408,
          message: 'Request timeout',
        },
      })
    }

    if (error.response) {
      // Spotify API returned an error
      const status = error.response.status
      const errorData = error.response.data

      // Forward rate limiting headers
      if (status === 429 && error.response.headers['retry-after']) {
        res.set('Retry-After', error.response.headers['retry-after'])
      }

      return res.status(status).json(errorData)
    }

    // Network or other error
    res.status(500).json({
      error: {
        status: 500,
        message: 'Internal server error',
      },
    })
  }
})

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: {
      status: 500,
      message: 'Internal server error',
    },
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      status: 404,
      message: 'Endpoint not found',
    },
  })
})

// Start server
// HOST defaults to '::' (IPv6 all-interfaces, also accepts IPv4 via
// IPv4-mapped addresses). Required for Fly.io: their 6PN WireGuard
// mesh is IPv6-only, so binding to '0.0.0.0' (IPv4-only) would make
// us unreachable from other Fly Machines and from Fly Proxy itself.
// Node's default IS '::' when IPv6 is available, but being explicit
// removes any ambiguity and documents the choice for future readers.
const HOST = process.env.HOST || '::'
app.listen(PORT, HOST, () => {
  console.log(`🚀 Spotify Proxy Server running on ${HOST}:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
  console.log(`🎵 Proxy endpoint: http://localhost:${PORT}/api/spotify/*`)

  // Test Spotify credentials on startup
  getSpotifyToken()
    .then(() => console.log('✅ Spotify API credentials verified'))
    .catch((err) => console.error('❌ Spotify API credentials failed:', err.message))
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})
