import { ENABLE_OFFLINE_CACHE } from './config'

// Cache configuration
const CACHE_PREFIX = 'nextsound_cache_'
const CACHE_VERSION = 'v1'
const CACHE_KEY_PREFIX = `${CACHE_PREFIX}${CACHE_VERSION}_`

// Cache expiration times (in milliseconds)
export const CACHE_EXPIRATION = {
  FEATURED_PLAYLISTS: 30 * 60 * 1000, // 30 minutes
  NEW_RELEASES: 60 * 60 * 1000, // 1 hour
  TOP_TRACKS: 15 * 60 * 1000, // 15 minutes
  SEARCH_RESULTS: 5 * 60 * 1000, // 5 minutes
  TRACK_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  ALBUM_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  ARTIST_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
}

interface CacheItem {
  data: any
  timestamp: number
  expiration: number
  key: string
}

class OfflineCache {
  private isEnabled: boolean

  constructor() {
    this.isEnabled = ENABLE_OFFLINE_CACHE && typeof Storage !== 'undefined'
    if (this.isEnabled) {
      this.cleanupExpiredItems()
    }
  }

  /**
   * Store data in cache with expiration
   */
  set(key: string, data: any, expirationTime: number): void {
    if (!this.isEnabled) return

    const cacheKey = `${CACHE_KEY_PREFIX}${key}`
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      expiration: Date.now() + expirationTime,
      key: cacheKey,
    }

    try {
      localStorage.setItem(cacheKey, JSON.stringify(item))

      // Also store metadata for cleanup
      this.updateCacheMetadata(cacheKey, item.expiration)
    } catch (error) {
      console.warn('Failed to store in cache:', error)
      // If storage is full, try to make space
      this.cleanupExpiredItems()
      try {
        localStorage.setItem(cacheKey, JSON.stringify(item))
        this.updateCacheMetadata(cacheKey, item.expiration)
      } catch (retryError) {
        console.error('Failed to store in cache after cleanup:', retryError)
      }
    }
  }

  /**
   * Retrieve data from cache if not expired
   */
  get(key: string): any | null {
    if (!this.isEnabled) return null

    const cacheKey = `${CACHE_KEY_PREFIX}${key}`

    try {
      const itemStr = localStorage.getItem(cacheKey)
      if (!itemStr) return null

      const item: CacheItem = JSON.parse(itemStr)

      // Check if item has expired
      if (Date.now() > item.expiration) {
        this.remove(key)
        return null
      }

      return item.data
    } catch (error) {
      console.warn('Failed to retrieve from cache:', error)
      // Remove corrupted item
      this.remove(key)
      return null
    }
  }

  /**
   * Remove specific item from cache
   */
  remove(key: string): void {
    if (!this.isEnabled) return

    const cacheKey = `${CACHE_KEY_PREFIX}${key}`
    try {
      localStorage.removeItem(cacheKey)
      this.removeCacheMetadata(cacheKey)
    } catch (error) {
      console.warn('Failed to remove from cache:', error)
    }
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    if (!this.isEnabled) return

    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))
      localStorage.removeItem(`${CACHE_KEY_PREFIX}metadata`)
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  /**
   * Check if an item exists in cache and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; items: number; enabled: boolean } {
    if (!this.isEnabled) {
      return { size: 0, items: 0, enabled: false }
    }

    let size = 0
    let items = 0

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(CACHE_KEY_PREFIX)) {
          const value = localStorage.getItem(key)
          if (value) {
            size += value.length
            items++
          }
        }
      }
    } catch (error) {
      console.warn('Failed to calculate cache stats:', error)
    }

    return { size, items, enabled: this.isEnabled }
  }

  /**
   * Clean up expired cache items
   */
  private cleanupExpiredItems(): void {
    if (!this.isEnabled) return

    try {
      const now = Date.now()
      const keysToRemove: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(CACHE_KEY_PREFIX) && key !== `${CACHE_KEY_PREFIX}metadata`) {
          const itemStr = localStorage.getItem(key)
          if (itemStr) {
            try {
              const item: CacheItem = JSON.parse(itemStr)
              if (now > item.expiration) {
                keysToRemove.push(key)
              }
            } catch (_parseError) {
              // Remove corrupted items
              keysToRemove.push(key)
            }
          }
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key)
        this.removeCacheMetadata(key)
      })

      if (keysToRemove.length > 0) {
        console.log(`Cleaned up ${keysToRemove.length} expired cache items`)
      }
    } catch (error) {
      console.warn('Failed to cleanup expired cache items:', error)
    }
  }

  /**
   * Update cache metadata for cleanup tracking
   */
  private updateCacheMetadata(key: string, expiration: number): void {
    try {
      const metadataKey = `${CACHE_KEY_PREFIX}metadata`
      const metadata = JSON.parse(localStorage.getItem(metadataKey) || '{}')
      metadata[key] = expiration
      localStorage.setItem(metadataKey, JSON.stringify(metadata))
    } catch (error) {
      // Metadata is optional, don't fail if it can't be stored
      console.warn('Failed to update cache metadata:', error)
    }
  }

  /**
   * Remove cache metadata
   */
  private removeCacheMetadata(key: string): void {
    try {
      const metadataKey = `${CACHE_KEY_PREFIX}metadata`
      const metadata = JSON.parse(localStorage.getItem(metadataKey) || '{}')
      delete metadata[key]
      localStorage.setItem(metadataKey, JSON.stringify(metadata))
    } catch (error) {
      // Metadata is optional, don't fail if it can't be updated
      console.warn('Failed to remove cache metadata:', error)
    }
  }
}

// Create singleton instance
export const offlineCache = new OfflineCache()

// Utility functions for specific cache operations
export const cacheHelpers = {
  // Featured playlists
  getFeaturedPlaylists: () => offlineCache.get('featured_playlists'),
  setFeaturedPlaylists: (data: any) =>
    offlineCache.set('featured_playlists', data, CACHE_EXPIRATION.FEATURED_PLAYLISTS),

  // New releases
  getNewReleases: () => offlineCache.get('new_releases'),
  setNewReleases: (data: any) =>
    offlineCache.set('new_releases', data, CACHE_EXPIRATION.NEW_RELEASES),

  // Top tracks
  getTopTracks: () => offlineCache.get('top_tracks'),
  setTopTracks: (data: any) => offlineCache.set('top_tracks', data, CACHE_EXPIRATION.TOP_TRACKS),

  // Search results
  getSearchResults: (query: string, type: string) => offlineCache.get(`search_${type}_${query}`),
  setSearchResults: (query: string, type: string, data: any) =>
    offlineCache.set(`search_${type}_${query}`, data, CACHE_EXPIRATION.SEARCH_RESULTS),

  // Track details
  getTrack: (id: string) => offlineCache.get(`track_${id}`),
  setTrack: (id: string, data: any) =>
    offlineCache.set(`track_${id}`, data, CACHE_EXPIRATION.TRACK_DETAILS),

  // Album details
  getAlbum: (id: string) => offlineCache.get(`album_${id}`),
  setAlbum: (id: string, data: any) =>
    offlineCache.set(`album_${id}`, data, CACHE_EXPIRATION.ALBUM_DETAILS),

  // Artist details
  getArtist: (id: string) => offlineCache.get(`artist_${id}`),
  setArtist: (id: string, data: any) =>
    offlineCache.set(`artist_${id}`, data, CACHE_EXPIRATION.ARTIST_DETAILS),
}

// Network status detection
export const networkHelpers = {
  isOnline: () => navigator.onLine,

  // Add event listeners for online/offline status
  addNetworkListeners: (onOnline: () => void, onOffline: () => void) => {
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    // Return cleanup function
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  },
}
