/**
 * MCPAudioService - Enhanced Spotify integration for preview URL fetching
 *
 * This service provides MCP-style functionality for fetching Spotify track preview URLs
 * while leveraging our existing backend proxy and API infrastructure.
 */

import type { ITrack } from '@/types'
import { SPOTIFY_API_BASE_URL } from '@/utils/config'

export interface PreviewTrack extends ITrack {
  preview_url?: string | null
  spotify_id?: string
}

export class MCPAudioService {
  private baseUrl: string
  private retryAttempts: number = 3
  private retryDelay: number = 1000

  constructor() {
    // Pull from the central config so all services share one source of truth.
    // SPOTIFY_API_BASE_URL resolves to '/api/spotify' in compose (relative),
    // or to the absolute URL if VITE_PROXY_SERVER_URL is set explicitly.
    this.baseUrl = SPOTIFY_API_BASE_URL
  }

  /**
   * Fetch a track with its preview URL from Spotify
   */
  async fetchTrackWithPreview(trackId: string): Promise<PreviewTrack | null> {
    try {
      console.log(`🎵 MCPAudioService: Fetching track details for ${trackId}`)

      const response = await this.makeRequest(`/tracks/${trackId}`)

      if (!response.ok) {
        console.error(`Failed to fetch track ${trackId}:`, response.status)
        return null
      }

      const spotifyTrack = await response.json()

      // Transform Spotify track to our ITrack format with preview URL
      const track: PreviewTrack = {
        id: spotifyTrack.id,
        original_title: spotifyTrack.name,
        name: spotifyTrack.name,
        poster_path: spotifyTrack.album?.images?.[0]?.url || null,
        backdrop_path: spotifyTrack.album?.images?.[0]?.url || null,
        overview: `${spotifyTrack.artists?.[0]?.name || 'Unknown Artist'} - ${spotifyTrack.album?.name || 'Unknown Album'}`,
        artist: spotifyTrack.artists?.[0]?.name || 'Unknown Artist',
        album: spotifyTrack.album?.name || 'Unknown Album',
        duration: Math.round((spotifyTrack.duration_ms || 0) / 1000),
        popularity: spotifyTrack.popularity || 0,
        preview_url: spotifyTrack.preview_url, // This is the key enhancement!
        spotify_id: spotifyTrack.id,
      }

      console.log(`✅ MCPAudioService: Track fetched successfully`, {
        name: track.name,
        hasPreview: !!track.preview_url,
        previewUrl: track.preview_url?.substring(0, 50) + '...',
      })

      return track
    } catch (error) {
      console.error(`❌ MCPAudioService: Error fetching track ${trackId}:`, error)
      return null
    }
  }

  /**
   * Search for tracks with preview URLs
   */
  async searchTracksWithPreviews(query: string, limit: number = 10): Promise<PreviewTrack[]> {
    try {
      console.log(`🔍 MCPAudioService: Searching tracks with previews for "${query}"`)

      const response = await this.makeRequest(
        `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      )

      if (!response.ok) {
        console.error(`Search failed:`, response.status)
        return []
      }

      const data = await response.json()
      const tracks = data.tracks?.items || []

      // Transform and filter tracks with preview URLs
      const tracksWithPreviews: PreviewTrack[] = tracks
        .map((spotifyTrack: any) => ({
          id: spotifyTrack.id,
          original_title: spotifyTrack.name,
          name: spotifyTrack.name,
          poster_path: spotifyTrack.album?.images?.[0]?.url || null,
          backdrop_path: spotifyTrack.album?.images?.[0]?.url || null,
          overview: `${spotifyTrack.artists?.[0]?.name || 'Unknown Artist'} - ${spotifyTrack.album?.name || 'Unknown Album'}`,
          artist: spotifyTrack.artists?.[0]?.name || 'Unknown Artist',
          album: spotifyTrack.album?.name || 'Unknown Album',
          duration: Math.round((spotifyTrack.duration_ms || 0) / 1000),
          popularity: spotifyTrack.popularity || 0,
          preview_url: spotifyTrack.preview_url,
          spotify_id: spotifyTrack.id,
        }))
        .filter((track: PreviewTrack) => track.preview_url) // Only tracks with previews

      console.log(
        `✅ MCPAudioService: Found ${tracksWithPreviews.length} tracks with preview URLs out of ${tracks.length} total tracks`,
      )

      return tracksWithPreviews
    } catch (error) {
      console.error(`❌ MCPAudioService: Search error:`, error)
      return []
    }
  }

  /**
   * Enhance an existing track with preview URL data
   */
  async enhanceTrackWithPreview(track: ITrack): Promise<PreviewTrack> {
    // If track already has preview URL, return as-is
    if ('preview_url' in track && track.preview_url) {
      return track as PreviewTrack
    }

    // Try to find the track on Spotify by searching for it
    const searchQuery = `track:"${track.name || track.original_title}" artist:"${track.artist}"`
    const searchResults = await this.searchTracksWithPreviews(searchQuery, 1)

    if (searchResults.length > 0) {
      console.log(`🔄 MCPAudioService: Enhanced track "${track.name}" with preview URL`)

      // Merge the original track data with the preview URL
      return {
        ...track,
        preview_url: searchResults[0].preview_url,
        spotify_id: searchResults[0].spotify_id,
      }
    }

    console.log(`⚠️ MCPAudioService: No preview URL found for track "${track.name}"`)

    // Return track without preview URL
    return {
      ...track,
      preview_url: null,
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest(endpoint: string, attempt: number = 1): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url)

      if (!response.ok && attempt < this.retryAttempts) {
        console.log(
          `🔄 MCPAudioService: Retrying request (attempt ${attempt + 1}/${this.retryAttempts})`,
        )
        await this.delay(this.retryDelay * attempt)
        return this.makeRequest(endpoint, attempt + 1)
      }

      return response
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.log(
          `🔄 MCPAudioService: Retrying after network error (attempt ${attempt + 1}/${this.retryAttempts})`,
        )
        await this.delay(this.retryDelay * attempt)
        return this.makeRequest(endpoint, attempt + 1)
      }
      throw error
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Check if the service is available (backend proxy is running)
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=test&type=track&limit=1`)
      return response.ok
    } catch {
      return false
    }
  }
}

// Singleton instance
export const mcpAudioService = new MCPAudioService()
