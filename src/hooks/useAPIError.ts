import { useState } from 'react'
import { APIError, ErrorType } from '@/services/SpotifyAPI'

export const useAPIError = () => {
  const [error, setError] = useState<APIError | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleError = (error: any) => {
    // If it's already our enhanced APIError, use it directly
    if (error instanceof APIError) {
      setError(error)
      return
    }

    // Otherwise, create a new APIError from the unknown error
    const apiError = new APIError({
      type: error.type || ErrorType.NETWORK_ERROR,
      status: error.status || 500,
      message: error.message || 'An unexpected error occurred',
      userMessage: error.userMessage,
      code: error.code || 'UNKNOWN_ERROR',
      retryable:
        error.retryable !== undefined
          ? error.retryable
          : error.status >= 500 || error.status === 429,
      retryAfter: error.retryAfter,
      context: error.context,
    })
    setError(apiError)
  }

  const retry = async (retryFn: () => Promise<any>) => {
    setIsRetrying(true)
    setError(null)
    try {
      await retryFn()
    } catch (err) {
      handleError(err)
    } finally {
      setIsRetrying(false)
    }
  }

  const clearError = () => setError(null)

  return { error, isRetrying, handleError, retry, clearError }
}
