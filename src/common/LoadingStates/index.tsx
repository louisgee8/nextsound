import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${sizeClasses[size]}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  message?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message }) => (
  <div className="w-full max-w-md">
    {message && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{message}</p>}
    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  </div>
)

interface SkeletonProps {
  className?: string
}

const SkeletonBox: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded-sm ${className}`} />
)

interface SkeletonLoaderProps {
  type: 'track' | 'album' | 'playlist' | 'card'
  count?: number
}

const TrackSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4">
    <SkeletonBox className="w-12 h-12" />
    <div className="flex-1 space-y-2">
      <SkeletonBox className="h-4 w-3/4" />
      <SkeletonBox className="h-3 w-1/2" />
    </div>
    <SkeletonBox className="h-8 w-16" />
  </div>
)

const AlbumSkeleton: React.FC = () => (
  <div className="flex flex-col space-y-4">
    <SkeletonBox className="w-full aspect-square" />
    <div className="space-y-2">
      <SkeletonBox className="h-5 w-3/4" />
      <SkeletonBox className="h-4 w-1/2" />
    </div>
  </div>
)

const PlaylistSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4">
    <SkeletonBox className="w-16 h-16 rounded-sm" />
    <div className="flex-1 space-y-2">
      <SkeletonBox className="h-5 w-2/3" />
      <SkeletonBox className="h-3 w-1/3" />
      <SkeletonBox className="h-3 w-1/4" />
    </div>
  </div>
)

const CardSkeleton: React.FC = () => (
  <div className="space-y-3">
    <SkeletonBox className="w-full aspect-video" />
    <div className="space-y-2">
      <SkeletonBox className="h-4 w-3/4" />
      <SkeletonBox className="h-3 w-1/2" />
    </div>
  </div>
)

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }, (_, index) => (
      <div key={index}>
        {type === 'track' && <TrackSkeleton />}
        {type === 'album' && <AlbumSkeleton />}
        {type === 'playlist' && <PlaylistSkeleton />}
        {type === 'card' && <CardSkeleton />}
      </div>
    ))}
  </div>
)
