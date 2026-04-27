import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Set up MSW worker for browser environment
export const worker = setupWorker(...handlers)

// Start the worker conditionally based on environment
export const startMocking = async () => {
  // Only enable MSW in development when explicitly requested
  const shouldMock = import.meta.env.VITE_USE_MSW === 'true'

  if (shouldMock) {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass', // Don't mock requests not explicitly handled
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      })
      console.log('🎭 MSW: API mocking enabled')
      return true
    } catch (error) {
      console.warn('⚠️ MSW: Failed to start worker:', error)
      return false
    }
  }

  return false
}
