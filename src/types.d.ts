export interface ITheme {
  title: string
  icon: IconType
}

export interface INavLink extends ITheme {
  path: string
}

// Spotify API response types
export interface SpotifyImage {
  height: number
  url: string
  width: number
}

export interface SpotifyArtist {
  id: string
  name: string
  type: 'artist'
  uri: string
  external_urls: {
    spotify: string
  }
}

export interface SpotifyAlbum {
  id: string
  name: string
  album_type: 'album' | 'single' | 'compilation'
  artists: SpotifyArtist[]
  images: SpotifyImage[]
  release_date: string
  total_tracks: number
  uri: string
  external_urls: {
    spotify: string
  }
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  duration_ms: number
  popularity: number
  preview_url: string | null
  track_number: number
  uri: string
  external_urls: {
    spotify: string
  }
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: SpotifyImage[]
  owner: {
    id: string
    display_name: string
  }
  tracks: {
    total: number
  }
  uri: string
  external_urls: {
    spotify: string
  }
}

// Normalized interfaces for our app
export interface ITrack {
  id: string
  poster_path: string // album cover URL
  original_title: string // track name
  name: string // track name (alias)
  overview: string // description or artist info
  backdrop_path: string // larger image
  artist?: string
  album?: string
  duration?: number
  spotify_id?: string
  preview_url?: string | null
  external_urls?: {
    spotify: string
  }
  popularity?: number // Spotify popularity score (0-100)
  // Search enhancement fields
  genre?: string // Primary genre for search
  year?: number // Release year for search
  // Legacy properties for backward compatibility
  title?: string
}

export interface IAlbum {
  id: string
  poster_path: string // album cover
  original_title: string // album name
  name: string // album name (alias)
  overview: string // album description
  backdrop_path: string // larger image
  artists: string[] // artist names
  release_date: string
  total_tracks: number
  spotify_id?: string
  external_urls?: {
    spotify: string
  }
}

export interface IArtist {
  id: string
  poster_path: string // artist image
  original_title: string // artist name
  name: string // artist name (alias)
  overview: string // artist bio
  backdrop_path: string // larger image
  genres?: string[]
  followers?: number
  popularity?: number
  spotify_id?: string
  external_urls?: {
    spotify: string
  }
}
