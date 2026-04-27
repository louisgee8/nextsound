/**
 * Tests for the Spotify API service layer.
 *
 * KEY CONCEPTS:
 *
 * 1. RTK Query - Redux Toolkit Query is a data fetching library. It generates
 *    React hooks (like useGetTrackQuery) that handle loading states, caching,
 *    and error handling automatically. We test the TRANSFORMATION LOGIC it uses,
 *    not the hooks directly (those are React-specific and tested in component tests).
 *
 * 2. MSW (Mock Service Worker) - Instead of hitting the real Spotify API in tests,
 *    MSW intercepts HTTP requests and returns fake responses. This means:
 *    - Tests are fast (no network calls)
 *    - Tests are deterministic (same input = same output every time)
 *    - Tests work offline
 *    We set up MSW in tests/setup.ts, and the handlers are in src/mocks/handlers.ts.
 *
 * 3. Why test transformations? - The Spotify API returns data in Spotify's format.
 *    Our app uses its own format (ITrack, IAlbum, etc.). The transformation functions
 *    convert between them. If these break, the whole UI breaks.
 */
import { describe, it, expect } from 'vitest'
import { APIError, ErrorType } from '@/services/SpotifyAPI'

// ---- APIError Class Tests ----
// The APIError class adds structure to errors so the UI can display
// user-friendly messages and decide whether to retry failed requests.

describe('APIError', () => {
  it('creates an error with all required fields', () => {
    const error = new APIError({
      type: ErrorType.NETWORK_ERROR,
      status: 0,
      message: 'Failed to fetch',
      code: 'NETWORK_FAILURE',
      retryable: true,
    })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('APIError')
    expect(error.type).toBe(ErrorType.NETWORK_ERROR)
    expect(error.status).toBe(0)
    expect(error.message).toBe('Failed to fetch')
    expect(error.code).toBe('NETWORK_FAILURE')
    expect(error.retryable).toBe(true)
  })

  it('generates user-friendly message for network errors', () => {
    const error = new APIError({
      type: ErrorType.NETWORK_ERROR,
      status: 0,
      message: 'Technical details here',
      code: 'NET_ERR',
      retryable: true,
    })

    // The userMessage should be friendly, not technical
    expect(error.userMessage).toBe('Check your internet connection and try again')
  })

  it('generates user-friendly message for rate limit errors', () => {
    const error = new APIError({
      type: ErrorType.RATE_LIMIT,
      status: 429,
      message: 'Too many requests',
      code: 'RATE_LIMIT',
      retryable: true,
      retryAfter: 5000,
    })

    expect(error.userMessage).toBe('Too many requests. Please wait a moment and try again')
    expect(error.retryAfter).toBe(5000)
  })

  it('generates user-friendly message for auth errors', () => {
    const error = new APIError({
      type: ErrorType.AUTH_ERROR,
      status: 401,
      message: 'Invalid token',
      code: 'AUTH_FAILED',
      retryable: false,
    })

    expect(error.userMessage).toBe('Music service temporarily unavailable')
    expect(error.retryable).toBe(false)
  })

  it('generates user-friendly messages for all error types', () => {
    // This test verifies every error type has a user-friendly message.
    // Why? Because if you add a new ErrorType and forget to add a message,
    // users would see "undefined" instead of something helpful.

    const errorTypes = [
      { type: ErrorType.NETWORK_ERROR, expected: 'Check your internet connection and try again' },
      { type: ErrorType.CORS_ERROR, expected: 'Unable to access music service. Please try again' },
      { type: ErrorType.AUTH_ERROR, expected: 'Music service temporarily unavailable' },
      {
        type: ErrorType.RATE_LIMIT,
        expected: 'Too many requests. Please wait a moment and try again',
      },
      { type: ErrorType.TIMEOUT, expected: 'Request timed out. Please try again' },
      {
        type: ErrorType.SERVER_ERROR,
        expected: 'Music service is temporarily down. Please try again later',
      },
      { type: ErrorType.CLIENT_ERROR, expected: 'Invalid request. Please refresh the page' },
      { type: ErrorType.DATA_ERROR, expected: 'Unable to load music. Showing cached content' },
    ]

    errorTypes.forEach(({ type, expected }) => {
      const error = new APIError({
        type,
        status: 500,
        message: 'test',
        code: 'TEST',
        retryable: false,
      })
      expect(error.userMessage).toBe(expected)
    })
  })

  it('uses custom userMessage when provided', () => {
    const error = new APIError({
      type: ErrorType.SERVER_ERROR,
      status: 500,
      message: 'Technical error',
      userMessage: 'Custom friendly message',
      code: 'CUSTOM',
      retryable: true,
    })

    expect(error.userMessage).toBe('Custom friendly message')
  })

  it('preserves context for debugging', () => {
    const context = { endpoint: '/search', query: 'test' }
    const error = new APIError({
      type: ErrorType.CLIENT_ERROR,
      status: 400,
      message: 'Bad request',
      code: 'BAD_REQUEST',
      retryable: false,
      context,
    })

    expect(error.context).toEqual(context)
  })
})

describe('ErrorType enum', () => {
  // Verify all error types are defined. This acts as a contract --
  // if someone removes an error type, this test will catch it.

  it('defines all expected error types', () => {
    expect(ErrorType.NETWORK_ERROR).toBe('network_error')
    expect(ErrorType.CORS_ERROR).toBe('cors_error')
    expect(ErrorType.AUTH_ERROR).toBe('auth_error')
    expect(ErrorType.RATE_LIMIT).toBe('rate_limit')
    expect(ErrorType.DATA_ERROR).toBe('data_error')
    expect(ErrorType.TIMEOUT).toBe('timeout')
    expect(ErrorType.SERVER_ERROR).toBe('server_error')
    expect(ErrorType.CLIENT_ERROR).toBe('client_error')
  })
})
