import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../src/mocks/server'

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

// Reset handlers after each test (so one test doesn't affect another)
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Clean up after all tests are done
afterAll(() => {
  server.close()
})

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.matchMedia (used by theme and motion hooks)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock IntersectionObserver (used by lazy loading)
class IntersectionObserverMock {
  observe = () => {}
  disconnect = () => {}
  unobserve = () => {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverMock,
})

// Mock HTMLMediaElement methods (used by audio player)
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: () => Promise.resolve(),
})

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: () => {},
})

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: () => {},
})
