import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { spotifyApi } from './SpotifyAPI'
import type { ITrack } from '@/types'
import { getMockData, shouldUseMockData, getMockTrackById } from '@/data/mockMusicData'
import { performEnhancedSearch } from '@/utils/searchAlgorithm'

// Content strategy constants
const ADVANCED_SEARCH_STRATEGY = 'ADVANCED_SEARCH'

// Playlist ID mappings (legacy support)
const PLAYLIST_IDS = {
  TRACKS_POPULAR: '37i9dQZF1DXcBWIGoYBM5M', // Today's Top Hits (31M+ followers)
  PLAYLISTS_TOPLISTS: '37i9dQZF1DX4o1BcGBQzKt', // Electronic Rising
} as const

// Content strategies for different sections
const CONTENT_STRATEGIES: Record<string, string> = {
  // Primary sections using advanced search
  'tracks-latest': ADVANCED_SEARCH_STRATEGY, // Year-based search strategy

  // Legacy playlist mappings (kept for compatibility)
  'tracks-popular': PLAYLIST_IDS.TRACKS_POPULAR,
  'playlists-toplists': PLAYLIST_IDS.PLAYLISTS_TOPLISTS,

  // Album-specific strategies using advanced search
  'albums-new_releases': ADVANCED_SEARCH_STRATEGY, // Latest album releases
  'albums-popular': ADVANCED_SEARCH_STRATEGY, // Popular album search
  'albums-classic': ADVANCED_SEARCH_STRATEGY, // Classic album search
  'albums-indie': ADVANCED_SEARCH_STRATEGY, // Independent album search

  // Additional genre expansions
  'tracks-throwback': ADVANCED_SEARCH_STRATEGY, // Year-based throwback search
  'tracks-classic': ADVANCED_SEARCH_STRATEGY, // Classic hits search
  'tracks-rnb-classic': ADVANCED_SEARCH_STRATEGY, // R&B classics search
  'tracks-chill': ADVANCED_SEARCH_STRATEGY, // Chill music search
} as const

// Create a unified API that wraps Spotify functionality
export const musicApi = createApi({
  reducerPath: 'musicApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }), // Dummy base query since we're using manual queries

  endpoints: (builder) => ({
    // This is just a placeholder - we'll use the Spotify API directly
    getTracks: builder.query<
      { results: ITrack[] },
      {
        category: string | undefined
        type?: string
        page?: number
        searchQuery?: string
        showSimilarTracks?: boolean
        id?: number
      }
    >({
      query: () => '', // Dummy query since we handle this manually
    }),

    getTrack: builder.query<ITrack, { category: string; id: number }>({
      query: () => '', // Dummy query since we handle this manually
    }),
  }),
})

// Create hooks that provide music data through Spotify API integration
export const useGetTracksQuery = (
  args: {
    category: string | undefined
    type?: string
    page?: number
    searchQuery?: string
    showSimilarTracks?: boolean
    id?: number
    cacheKey?: string // Add unique cache key
  },
  options?: { skip?: boolean },
) => {
  const { category, type, searchQuery, showSimilarTracks } = args
  const { skip = false } = options || {}

  // Check if we should use mock data
  const useMockData = shouldUseMockData()

  // Early return with mock data if no API available
  if (useMockData && !searchQuery && !showSimilarTracks) {
    const mockData = getMockData(category || 'tracks', type || 'popular')
    return {
      data: mockData,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: undefined,
    } as any
  }

  // Handle search queries
  if (searchQuery) {
    // In mock mode, return filtered mock data for search
    if (useMockData) {
      // Get comprehensive mock data from all sources
      const latestHits = getMockData('tracks', 'latest')
      const popularTracks = getMockData('tracks', 'popular')
      const allTracks = [...latestHits.results, ...popularTracks.results]

      // Enhanced search algorithm (now using shared utility)
      const searchResults = performEnhancedSearch(allTracks, searchQuery).map(
        (result) => result.track,
      )

      return {
        data: { results: searchResults },
        isLoading: false,
        isFetching: false,
        isError: false,
        error: undefined,
      } as any
    }

    if (category === 'tracks') {
      return spotifyApi.useSearchMusicQuery(
        {
          query: searchQuery,
          type: 'track',
          limit: 10,
        },
        { skip },
      )
    } else if (category === 'albums') {
      return spotifyApi.useSearchMusicQuery(
        {
          query: searchQuery,
          type: 'album',
          limit: 10,
        },
        { skip },
      )
    }
  }

  // Handle similar tracks (related content)
  if (showSimilarTracks) {
    // In mock mode, return a subset of popular tracks
    if (useMockData) {
      const mockData = getMockData('tracks', 'popular')
      return {
        data: { results: mockData.results.slice(0, 10) },
        isLoading: false,
        isFetching: false,
        isError: false,
        error: undefined,
      } as any
    }

    return spotifyApi.useSearchMusicQuery(
      {
        query: 'recommended',
        type: 'track',
        limit: 10,
      },
      { skip },
    )
  }

  // Content strategy trigger - return playlist ID or ADVANCED_SEARCH strategy
  const getPlaylistIdForSection = (category: string, type: string): string | null => {
    return CONTENT_STRATEGIES[`${category}-${type}`] || null
  }

  // Deduplication helper to ensure unique content across sections
  const deduplicateResults = (data: any) => {
    if (!data?.results) return data

    const seen = new Set()
    const uniqueResults = data.results.filter((track: any) => {
      const key = `${track.name?.toLowerCase()}-${track.artist?.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return { ...data, results: uniqueResults }
  }

  // Consistent popularity threshold for high-quality mainstream hits.
  // Lowered from 75 → 50 on 2026-04-26 because Spotify capped /search at 10
  // results and the old 75 gate emptied home-page tiles. See MIN_RESULTS_FALLBACK below.
  const POPULARITY_THRESHOLD = 50
  // If popularity filtering leaves fewer than this, fall back to the diversity-filtered
  // (pre-popularity) results so the home page never renders a fully empty grid.
  const MIN_RESULTS_FALLBACK = 6

  const getContentFilter = (_type: string) => {
    // Default: exclude ALL ambient content for mainstream sections (Latest Hits)
    return (track: any) => {
      const name = track.name?.toLowerCase() || ''
      const isAmbient =
        /sleep|white noise|rain|nature sounds|meditation|relax|ambient|loopable|asmr|calm|peaceful|gentle|soothing/i.test(
          name,
        )
      return !isAmbient
    }
  }

  // Adaptive filtering. Tuned for the post-2026 Spotify /search cap of 10 per query.
  // For small input sets (<=20 tracks combined across all queries), strict diversity
  // and popularity gates kill the home page. So we relax based on input size.
  // Sec+ frame: graceful degradation. Strict policy when you have abundance, permissive
  // policy when you have scarcity, but ALWAYS return something usable.
  const advancedFilterResults = (data: any, type: string) => {
    if (!data?.results) return data

    // Step 1: Basic deduplication (always safe and cheap)
    const deduplicated = deduplicateResults(data)

    // Step 2: Drop ambient/sleep tracks — they pollute mainstream sections
    const contentFilter = getContentFilter(type)
    const contentFiltered = deduplicated.results.filter(contentFilter)

    // Step 2.5: Sort by popularity descending so the best tracks float to the top
    const sortedByPopularity = contentFiltered.sort(
      (a: any, b: any) => (b.popularity || 0) - (a.popularity || 0),
    )

    // SMALL-INPUT BAILOUT: with the Spotify /search cap at 10, we usually have <20
    // raw tracks. Strict 1-per-artist + 75-popularity gates leave us with zero. Skip
    // them and return the dedup+content-filtered list. UI gets content, user gets a page.
    const SMALL_INPUT_THRESHOLD = 20
    if (sortedByPopularity.length <= SMALL_INPUT_THRESHOLD) {
      return { ...data, results: sortedByPopularity }
    }

    // Step 3 (large input only): Artist and Album diversity
    const artistCounts = new Map()
    const albumCounts = new Map()
    const diverseResults = sortedByPopularity.filter((track: any) => {
      const artist = track.artist?.toLowerCase()
      const album = track.album?.toLowerCase()

      if (!artist) return false

      const artistCount = artistCounts.get(artist) || 0
      if (artistCount >= 1) {
        return false
      }

      if (album) {
        const albumCount = albumCounts.get(album) || 0
        if (albumCount >= 2) {
          return false
        }
        albumCounts.set(album, albumCount + 1)
      }

      artistCounts.set(artist, artistCount + 1)
      return true
    })

    // Step 4 (large input only): Popularity gate with fallback
    const qualityFiltered = diverseResults.filter(
      (track: any) => (track.popularity || 0) >= POPULARITY_THRESHOLD,
    )
    const finalResults =
      qualityFiltered.length >= MIN_RESULTS_FALLBACK ? qualityFiltered : diverseResults

    return { ...data, results: finalResults }
  }

  // Handle different categories using simple 2024/2025 top tracks strategy
  const playlistId = getPlaylistIdForSection(category || '', type || '')

  if (playlistId === ADVANCED_SEARCH_STRATEGY || playlistId) {
    // Simple two-query strategy for 2024 and 2025 top tracks
    const query2024 = 'year:2024'
    const query2025 = 'year:2025'

    const query1Result = spotifyApi.useSearchMusicQuery(
      {
        query: query2024,
        type: category === 'albums' ? 'album' : 'track',
        limit: 10, // Spotify Web API max for /search is now 10 (binary-search confirmed 2026-04-26; was 50 pre-2024, briefly 20 in late 2024)
      },
      { skip },
    )

    const query2Result = spotifyApi.useSearchMusicQuery(
      {
        query: query2025,
        type: category === 'albums' ? 'album' : 'track',
        limit: 10, // Spotify Web API max for /search is now 10 (binary-search confirmed 2026-04-26; was 50 pre-2024, briefly 20 in late 2024)
      },
      { skip },
    )

    // Combine results from both 2024 and 2025 queries
    const allResults = [query1Result, query2Result]

    const allLoaded = allResults.every((result) => !result.isLoading)
    const hasError = allResults.every((result) => result.isError) // ALL must error to be a hard error
    const isLoading = allResults.some((result) => result.isLoading)

    // Render as soon as both queries finish loading. If one errors, use whatever data
    // the OTHER returned. Sec+ frame: graceful degradation, never let one failed
    // dependency take down the whole page.
    if (allLoaded && !hasError) {
      const combinedTracks: any[] = []

      allResults.forEach((result) => {
        if (!skip && result.data?.results) {
          combinedTracks.push(...result.data.results)
        }
      })

      if (combinedTracks.length > 0) {
        const combinedData = { results: combinedTracks }
        const enhancedData = advancedFilterResults(combinedData, type || '')

        return {
          data: enhancedData,
          isLoading: false,
          isFetching: false,
          isError: false,
          error: undefined,
        } as any
      }
    }

    // For single-query sections or while loading, use primary query
    return {
      ...query1Result,
      data: query1Result.data ? advancedFilterResults(query1Result.data, type || '') : undefined,
      isLoading: isLoading,
      isError: hasError,
    }
  }

  // Default fallback - empty results
  return {
    data: {
      results: [],
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: undefined,
  } as any
}

export const useGetTrackQuery = (
  args: { category: string; id: number | string },
  options?: { skip?: boolean },
) => {
  const { category, id } = args
  const { skip = false } = options || {}

  // Check if we should use mock data
  const useMockData = shouldUseMockData()

  // Handle both string and number IDs properly
  let stringId: string
  if (typeof id === 'number') {
    stringId = String(id)
  } else {
    stringId = id
  }

  // Validate that we have a proper ID
  if (!stringId || stringId.trim() === '' || stringId === 'undefined' || stringId === 'null') {
    console.error('Invalid ID provided to useGetShowQuery:', id)
    return {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 400, message: 'Invalid ID provided' },
    } as any
  }

  // In mock mode, try to find track by ID in mock data
  if (useMockData) {
    const mockTrack = getMockTrackById(stringId)
    if (mockTrack) {
      return {
        data: mockTrack,
        isLoading: false,
        isFetching: false,
        isError: false,
        error: undefined,
      } as any
    } else {
      return {
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: { status: 404, message: 'Track not found in mock data' },
      } as any
    }
  }

  if (category === 'tracks') {
    return spotifyApi.useGetTrackQuery({ id: stringId }, { skip })
  } else if (category === 'albums') {
    // Transform album response to track format for compatibility
    const albumQuery = spotifyApi.useGetAlbumQuery({ id: stringId }, { skip })
    return {
      ...albumQuery,
      data: albumQuery.data
        ? {
            ...albumQuery.data,
            artist: albumQuery.data.artists?.[0] || '',
            album: albumQuery.data.name,
            duration: 0,
            preview_url: null,
            title: albumQuery.data.name,
            genres: [],
          }
        : undefined,
    }
  } else if (category === 'artists') {
    // Handle artist details
    const artistQuery = spotifyApi.useGetArtistQuery({ id: stringId }, { skip })
    return {
      ...artistQuery,
      data: artistQuery.data
        ? {
            ...artistQuery.data,
            artist: artistQuery.data.name,
            album: '',
            duration: 0,
            preview_url: null,
            title: artistQuery.data.name,
            genres: artistQuery.data.genres || [],
          }
        : undefined,
    }
  }

  // Fallback: try to search for the ID (for unknown categories or legacy support)
  const searchQuery = spotifyApi.useSearchMusicQuery(
    {
      query: stringId,
      type: 'track',
      limit: 10, // Spotify Web API max for /search is now 10 (binary-search confirmed 2026-04-26; was 50 pre-2024, briefly 20 in late 2024)
    },
    { skip },
  )
  return {
    ...searchQuery,
    data: searchQuery.data?.results.find((track) => track.id === stringId) || undefined,
  }
}
