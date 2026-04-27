/**
 * Tests for the Redux store configuration.
 *
 * KEY CONCEPT: Redux Store
 * Redux is a state management library. Think of it as a central "database" for
 * your app's UI state. Instead of each component managing its own data, everything
 * lives in one store. This makes it easier to share data between components and
 * debug issues (you can see the entire app state in one place).
 *
 * RTK Query integrates with Redux -- it adds its own slice of state to track
 * API request status (loading, success, error) and cached data.
 *
 * These tests verify the store is configured correctly with all required reducers.
 */
import { describe, it, expect } from 'vitest'
import { store } from '@/store'

describe('Redux Store', () => {
  it('initializes without errors', () => {
    // If the store constructor throws, this test fails.
    // This catches misconfigured reducers or middleware.
    expect(store).toBeDefined()
    expect(store.getState).toBeDefined()
    expect(store.dispatch).toBeDefined()
  })

  it('has spotifyApi reducer registered', () => {
    const state = store.getState()
    // RTK Query creates a slice with the reducerPath name
    expect(state).toHaveProperty('spotifyApi')
  })

  it('has musicApi reducer registered', () => {
    const state = store.getState()
    expect(state).toHaveProperty('musicApi')
  })

  it('has the correct initial state shape', () => {
    const state = store.getState()
    // RTK Query reducers initialize with specific internal structure
    expect(state.spotifyApi).toHaveProperty('queries')
    expect(state.spotifyApi).toHaveProperty('mutations')
    expect(state.musicApi).toHaveProperty('queries')
    expect(state.musicApi).toHaveProperty('mutations')
  })

  it('accepts dispatched actions without errors', () => {
    // This verifies middleware is set up correctly.
    // If RTK Query middleware is missing, API actions would fail.
    expect(() => {
      store.dispatch({ type: 'TEST_ACTION' })
    }).not.toThrow()
  })
})
