import type { ReactNode } from 'react'
import React, { createContext, useContext } from 'react'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import type { ITrack } from '@/types'

interface AudioPlayerContextType {
  currentTrack: ITrack | null
  isPlaying: boolean
  progress: number
  volume: number
  isShuffled: boolean
  repeatMode: 'off' | 'one' | 'all'
  isMinimized: boolean
  queue: ITrack[]
  currentQueueIndex: number | null
  isQueueVisible: boolean
  playTrack: (track: ITrack) => void
  togglePlay: () => void
  skipNext: () => void
  skipPrevious: () => void
  seek: (position: number) => void
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  toggleFavorite: () => void
  toggleMinimize: () => void
  closePlayer: () => void
  addToQueue: (track: ITrack) => void
  removeFromQueue: (trackId: string) => void
  moveInQueue: (fromIndex: number, toIndex: number) => void
  clearQueue: () => void
  openQueue: () => void
  closeQueue: () => void
  toggleQueue: () => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

interface AudioPlayerProviderProps {
  children: ReactNode
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const audioPlayer = useAudioPlayer()

  return <AudioPlayerContext.Provider value={audioPlayer}>{children}</AudioPlayerContext.Provider>
}

export const useAudioPlayerContext = () => {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayerContext must be used within AudioPlayerProvider')
  }
  return context
}
