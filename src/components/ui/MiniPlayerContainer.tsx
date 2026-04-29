import React from 'react'
import { useAudioPlayerContext } from '@/context/audioPlayerContext'
import { MiniPlayer } from './MiniPlayer'

/**
 * MiniPlayerContainer — the "smart" wrapper that connects the dumb
 * MiniPlayer to the global audio context.
 *
 * Pattern: container/presentational separation.
 *  - MiniPlayer (dumb): takes props, emits callbacks, no context awareness.
 *  - MiniPlayerContainer (smart): reads context, passes props down, wires callbacks.
 *
 * If currentTrack is null the MiniPlayer renders nothing (it has its own
 * early-return), so we can mount this container unconditionally at App root.
 */
export const MiniPlayerContainer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    isShuffled,
    repeatMode,
    isMinimized,
    queue,
    togglePlay,
    skipNext,
    skipPrevious,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    toggleMinimize,
    toggleQueue,
    closePlayer,
  } = useAudioPlayerContext()

  return (
    <MiniPlayer
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      progress={progress}
      volume={volume}
      isShuffled={isShuffled}
      repeatMode={repeatMode}
      isMinimized={isMinimized}
      queueCount={queue.length}
      onTogglePlay={togglePlay}
      onSkipNext={skipNext}
      onSkipPrevious={skipPrevious}
      onSeek={seek}
      onVolumeChange={setVolume}
      onToggleShuffle={toggleShuffle}
      onToggleRepeat={toggleRepeat}
      onToggleFavorite={toggleFavorite}
      onToggleMinimize={toggleMinimize}
      onToggleQueue={toggleQueue}
      onClose={closePlayer}
    />
  )
}
