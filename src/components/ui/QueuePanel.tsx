import React from 'react'
import { FiX, FiTrash2, FiPlay, FiList } from 'react-icons/fi'
import { useAudioPlayerContext } from '@/context/audioPlayerContext'
import { getImageUrl, cn } from '@/utils'

/**
 * QueuePanel — slide-in drawer showing the upcoming track queue.
 *
 * Reads everything from the AudioPlayerContext. Mounts at App root so
 * it overlays all routes. Hidden via translate-x rather than unmounted,
 * so opening/closing is animated and cheap.
 */
export const QueuePanel: React.FC = () => {
  const {
    queue,
    currentQueueIndex,
    isQueueVisible,
    closeQueue,
    removeFromQueue,
    clearQueue,
    playTrack,
  } = useAudioPlayerContext()

  const formatDuration = (ms: number | undefined) => {
    if (!ms) return ''
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300',
          isQueueVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeQueue}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md z-50',
          'bg-white dark:bg-gray-900 shadow-2xl',
          'transition-transform duration-300 ease-out',
          'flex flex-col',
          isQueueVisible ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-label="Track queue"
        aria-hidden={!isQueueVisible}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FiList className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Queue{' '}
              {queue.length > 0 && <span className="text-gray-500 text-sm">({queue.length})</span>}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {queue.length > 0 && (
              <button
                type="button"
                onClick={clearQueue}
                aria-label="Clear queue"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeQueue}
              aria-label="Close queue"
              className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Track list */}
        <div className="flex-1 overflow-y-auto">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <FiList className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Your queue is empty.</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Hover any track and click the + button to add it.
              </p>
            </div>
          ) : (
            <ul className="py-2">
              {queue.map((track, index) => {
                const isActive = index === currentQueueIndex
                const displayTitle = track.original_title || track.name || 'Unknown Track'
                return (
                  <li
                    key={`${track.id}-${index}`}
                    className={cn(
                      'group flex items-center px-4 py-3 cursor-pointer transition-colors',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                    )}
                    onClick={() => playTrack(track)}
                  >
                    {/* Index / play indicator */}
                    <div className="w-6 mr-3 flex items-center justify-center">
                      <span
                        className={cn(
                          'text-xs font-mono group-hover:hidden',
                          isActive ? 'text-blue-600' : 'text-gray-400',
                        )}
                      >
                        {isActive ? '▶' : index + 1}
                      </span>
                      <FiPlay className="w-3 h-3 text-gray-700 dark:text-gray-200 hidden group-hover:block" />
                    </div>

                    {/* Poster */}
                    <img
                      src={getImageUrl(track.poster_path)}
                      alt={displayTitle}
                      className="w-10 h-10 rounded object-cover shadow-sm"
                    />

                    {/* Track info */}
                    <div className="flex-1 min-w-0 ml-3">
                      <p
                        className={cn(
                          'truncate text-sm font-medium',
                          isActive
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-900 dark:text-white',
                        )}
                      >
                        {displayTitle}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {track.artist || 'Unknown Artist'}
                      </p>
                    </div>

                    {/* Duration */}
                    {track.duration && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono ml-2">
                        {formatDuration(track.duration)}
                      </span>
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromQueue(track.id)
                      }}
                      aria-label={`Remove ${displayTitle} from queue`}
                      className="ml-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
