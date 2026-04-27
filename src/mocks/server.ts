import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Set up MSW server for test environment
export const server = setupServer(...handlers)

// Enable request interception in test environment
export const startMockingInTests = () => {
  // Server setup - the actual Jest hooks are called in tests/setup.ts
  return {
    server,
    start: () => {
      server.listen({ onUnhandledRequest: 'error' })
      console.log('🧪 MSW: Test server started')
    },
    reset: () => {
      server.resetHandlers()
    },
    close: () => {
      server.close()
      console.log('🧪 MSW: Test server closed')
    },
  }
}
