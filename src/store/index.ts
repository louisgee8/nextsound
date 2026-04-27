import { configureStore } from '@reduxjs/toolkit'
import { spotifyApi } from '@/services/SpotifyAPI'
import { musicApi } from '@/services/MusicAPI'

export const store = configureStore({
  reducer: {
    // New Spotify API
    [spotifyApi.reducerPath]: spotifyApi.reducer,
    // Unified Music API
    [musicApi.reducerPath]: musicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(spotifyApi.middleware, musicApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
