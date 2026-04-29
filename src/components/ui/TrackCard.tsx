import React, { useState } from 'react'
import { Card, CardContent } from './card'
import { FaClock } from 'react-icons/fa'
import { FiPlus, FiCheck } from 'react-icons/fi'
import type { ITrack } from '@/types'
import { getImageUrl, cn } from '@/utils'
import { useAudioPlayerContext } from '@/context/audioPlayerContext'

interface TrackCardProps {
  track: ITrack
  category: string
  isPlaying?: boolean
  onPlay?: (track: ITrack) => void
  variant?: 'compact' | 'detailed' | 'featured'
  className?: string
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  category: _category,
  isPlaying: _isPlayingProp,
  onPlay: _onPlayProp,
  variant = 'detailed',
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [justQueued, setJustQueued] = useState(false)

  // Audio context: clicking the card plays the track; the + button queues it.
  const { playTrack, addToQueue, queue } = useAudioPlayerContext()
  const isInQueue = queue.some((q) => q.id === track.id)

  const handleCardClick = () => {
    playTrack(track)
  }

  const handleQueueClick = (e: React.MouseEvent) => {
    // Stop propagation so the card's playTrack doesn't ALSO fire.
    e.stopPropagation()
    if (isInQueue) return
    addToQueue(track)
    setJustQueued(true)
    setTimeout(() => setJustQueued(false), 1500)
  }

  const { poster_path, original_title: title, name, artist, album, duration } = track
  const displayTitle = title || name || 'Unknown Track'

  const formatDuration = (ms: number) => {
    if (!ms) return ''
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const cardHeight = variant === 'compact' ? 'h-52' : variant === 'featured' ? 'h-84' : 'h-80'
  const imageHeight = variant === 'compact' ? 160 : variant === 'featured' ? 240 : 200

  return (
    <Card
      className={cn(
        'group relative transition-all duration-300 ease-out overflow-hidden',
        'hover:scale-[1.03] hover:-translate-y-2 cursor-pointer',
        'bg-paper dark:bg-leather-elevated border-0',
        'shadow-sm hover:shadow-card-hover',
        'rounded-xl p-4',
        cardHeight,
        'w-[180px]', // Slightly wider for better proportions
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      aria-label={`Play ${track.original_title || track.name || 'track'}`}
    >
      {/* Main Content */}
      <div className="block relative h-full">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-lg mb-3">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div
              className="absolute inset-0 bg-gray-200 dark:bg-hover-gray animate-pulse rounded-lg"
              style={{ height: imageHeight }}
            />
          )}

          {/* Album artwork */}
          <img
            src={getImageUrl(poster_path)}
            alt={displayTitle}
            className={cn(
              'w-full object-cover transition-all duration-300 rounded-lg',
              'group-hover:scale-105',
              'dark:brightness-75 dark:contrast-110 dark:saturate-90',
              'dark:group-hover:brightness-90 dark:group-hover:contrast-105 dark:group-hover:saturate-95',
              imageLoaded ? 'opacity-100' : 'opacity-0',
            )}
            style={{ height: imageHeight }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Gradient overlay on hover */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 rounded-lg',
              isHovered ? 'opacity-100' : 'opacity-0',
            )}
          />

          {/* Add-to-queue button (hover-revealed, top-right) */}
          <button
            type="button"
            onClick={handleQueueClick}
            disabled={isInQueue}
            aria-label={isInQueue ? 'Already in queue' : 'Add to queue'}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center',
              'transition-all duration-200',
              'shadow-md backdrop-blur-sm',
              isInQueue || justQueued
                ? 'bg-green-500 text-white opacity-100'
                : 'bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 hover:bg-white hover:scale-110',
              isHovered || isInQueue || justQueued ? 'opacity-100' : 'opacity-0',
              isInQueue && 'cursor-default',
            )}
          >
            {isInQueue || justQueued ? (
              <FiCheck className="w-4 h-4" />
            ) : (
              <FiPlus className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Track information */}
        <CardContent className="p-0 space-y-2">
          {/* Track title */}
          <h3
            className={cn(
              'font-semibold text-gray-900 dark:text-text-primary truncate transition-colors duration-200',
              variant === 'compact' ? 'text-sm' : 'text-base',
              'group-hover:text-accent-orange dark:group-hover:text-accent-orange',
            )}
          >
            {displayTitle}
          </h3>

          {/* Artist name */}
          <p
            className={cn(
              'text-gray-600 dark:text-text-secondary truncate font-medium',
              variant === 'compact' ? 'text-xs' : 'text-sm',
            )}
          >
            {artist || 'Unknown Artist'}
          </p>

          {/* Additional info for detailed variant */}
          {variant === 'detailed' && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2 flex-1 mr-2">
                {album && (
                  <span className="text-xs text-text-muted dark:text-text-secondary/70 truncate">
                    {album}
                  </span>
                )}
              </div>
              {duration && (
                <div className="flex items-center text-xs text-text-muted dark:text-text-secondary/70 shrink-0">
                  <FaClock className="w-3 h-3 mr-1 opacity-60" />
                  {formatDuration(duration)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>

      {/* Hover glow effect */}
      <div
        className={cn(
          'absolute -inset-1 bg-gradient-to-r from-spotify-green via-accent-orange to-warning-amber rounded-2xl opacity-0 transition-opacity duration-500 -z-10 blur-md',
          'dark:bg-gradient-to-r dark:from-blue-800 dark:via-slate-600 dark:to-blue-800',
          isHovered && 'opacity-10',
        )}
      />
    </Card>
  )
}
