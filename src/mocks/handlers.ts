import { http, HttpResponse } from 'msw'
import { MOCK_LATEST_HITS, MOCK_POPULAR_TRACKS, MOCK_HERO_TRACKS } from '@/data/mockMusicData'
// REMOVED: MOCK_LOFI_VIBES import - LoFi section no longer used

// Simulate realistic API delays
const withDelay = (ms: number = 200) => new Promise((resolve) => setTimeout(resolve, ms))

// Transform mock data to match Spotify API response format
const createSpotifySearchResponse = (tracks: any[]) => ({
  tracks: {
    href: 'https://api.spotify.com/v1/search?query=pop&type=track',
    limit: 20,
    next: null,
    offset: 0,
    previous: null,
    total: tracks.length,
    items: tracks.map((track) => ({
      album: {
        album_type: 'album',
        artists: [{ name: track.artist, id: `artist_${track.id}` }],
        images: [
          { url: track.poster_path, height: 640, width: 640 },
          { url: track.poster_path, height: 300, width: 300 },
          { url: track.poster_path, height: 64, width: 64 },
        ],
        name: track.album,
        id: `album_${track.id}`,
      },
      artists: [{ name: track.artist, id: `artist_${track.id}` }],
      duration_ms: track.duration,
      explicit: false,
      external_urls: { spotify: `https://open.spotify.com/track/${track.spotify_id}` },
      id: track.spotify_id,
      name: track.name,
      popularity: track.popularity,
      preview_url: track.preview_url,
      type: 'track',
      uri: `spotify:track:${track.spotify_id}`,
    })),
  },
})

export const handlers = [
  // Mock Spotify OAuth token endpoint
  http.post('https://accounts.spotify.com/api/token', async () => {
    await withDelay(100)
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    })
  }),

  // Mock Spotify search endpoint with different responses based on query
  http.get('https://api.spotify.com/v1/search', async ({ request }) => {
    await withDelay(300) // Realistic API delay

    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.toLowerCase() || ''

    // Simulate error conditions occasionally (5% chance)
    if (Math.random() < 0.05) {
      return HttpResponse.json(
        { error: { status: 429, message: 'Rate limit exceeded' } },
        { status: 429 },
      )
    }

    // Route different queries to different mock datasets
    let mockData
    if (query.includes('year:2024') || query.includes('year:2025') || query.includes('latest')) {
      mockData = MOCK_LATEST_HITS
    } else if (query.includes('lofi') || query.includes('chill') || query.includes('study')) {
      mockData = MOCK_POPULAR_TRACKS // Fallback to popular tracks - LoFi removed
    } else if (query.includes('popular') || query.includes('hits') || query.includes('chart')) {
      mockData = MOCK_POPULAR_TRACKS
    } else {
      // Default to a mix of content
      mockData = [...MOCK_LATEST_HITS.slice(0, 5), ...MOCK_POPULAR_TRACKS.slice(0, 5)]
    }

    return HttpResponse.json(createSpotifySearchResponse(mockData))
  }),

  // Mock individual track endpoint
  http.get('https://api.spotify.com/v1/tracks/:id', async ({ params }) => {
    await withDelay(200)

    const trackId = params.id as string

    // Find track in mock data
    const allTracks = [...MOCK_LATEST_HITS, ...MOCK_POPULAR_TRACKS, ...MOCK_HERO_TRACKS]
    const track = allTracks.find((t) => t.spotify_id === trackId || t.id === trackId)

    if (!track) {
      return HttpResponse.json(
        { error: { status: 404, message: 'Track not found' } },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      album: {
        album_type: 'album',
        artists: [{ name: track.artist, id: `artist_${track.id}` }],
        images: [
          { url: track.poster_path, height: 640, width: 640 },
          { url: track.poster_path, height: 300, width: 300 },
          { url: track.poster_path, height: 64, width: 64 },
        ],
        name: track.album,
        id: `album_${track.id}`,
      },
      artists: [{ name: track.artist, id: `artist_${track.id}` }],
      duration_ms: track.duration,
      explicit: false,
      external_urls: { spotify: `https://open.spotify.com/track/${track.spotify_id}` },
      id: track.spotify_id,
      name: track.name,
      popularity: track.popularity,
      preview_url: track.preview_url,
      type: 'track',
      uri: `spotify:track:${track.spotify_id}`,
    })
  }),

  // Mock backend proxy endpoints (for local development)
  http.post('http://localhost:3001/api/spotify/token', async () => {
    await withDelay(150)
    return HttpResponse.json({
      access_token: 'mock-proxy-token',
      token_type: 'Bearer',
      expires_in: 3600,
    })
  }),

  http.get('http://localhost:3001/api/spotify/search', async ({ request }) => {
    await withDelay(250)

    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.toLowerCase() || ''

    // Similar routing logic as direct API
    let mockData
    if (query.includes('year:2024') || query.includes('latest')) {
      mockData = MOCK_LATEST_HITS
    } else if (query.includes('lofi') || query.includes('chill')) {
      mockData = MOCK_POPULAR_TRACKS // Fallback to popular tracks - LoFi removed
    } else {
      mockData = MOCK_POPULAR_TRACKS
    }

    return HttpResponse.json(createSpotifySearchResponse(mockData))
  }),

  // Mock network failure scenarios for testing error handling
  http.get('https://api.spotify.com/v1/test-error', () => {
    return HttpResponse.error()
  }),
]
