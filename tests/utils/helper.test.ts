/**
 * Tests for utility helper functions.
 *
 * These are UNIT TESTS -- they test individual functions in isolation.
 * No React, no Redux, no API calls. Just: "give this input, expect this output."
 *
 * This is the simplest kind of test and the best place to start learning.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { getErrorMessage, saveTheme, getTheme, cn, getImageUrl } from '@/utils/helper'

describe('getErrorMessage', () => {
  // This function extracts a human-readable error message from different error shapes.
  // Why? Because errors come in many formats (API errors, network errors, plain strings)
  // and you need one function that handles them all consistently.

  it('returns error string from an API-style error with "error" field', () => {
    const error = { status: 400, error: 'Bad Request' }
    expect(getErrorMessage(error)).toBe('Bad Request')
  })

  it('returns stringified data from an API error with "data" field', () => {
    const error = { status: 500, data: { message: 'Internal Server Error' } }
    expect(getErrorMessage(error)).toBe(JSON.stringify({ message: 'Internal Server Error' }))
  })

  it('returns .message from a standard Error object', () => {
    const error = new Error('Something broke')
    expect(getErrorMessage(error)).toBe('Something broke')
  })

  it('returns a default message when error is null/undefined', () => {
    expect(getErrorMessage(null)).toBe('Unable to fetch the data. Please try again later.')
    expect(getErrorMessage(undefined)).toBe('Unable to fetch the data. Please try again later.')
  })
})

describe('saveTheme / getTheme', () => {
  // These functions persist the user's theme preference to localStorage.
  // localStorage is a browser API that saves key-value pairs that survive page refreshes.
  // We mocked it in setup.ts so these tests work without a real browser.

  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and retrieves a theme', () => {
    saveTheme('dark')
    expect(getTheme()).toBe('dark')
  })

  it('returns empty string when no theme is saved', () => {
    expect(getTheme()).toBe('')
  })

  it('overwrites the previous theme', () => {
    saveTheme('dark')
    saveTheme('light')
    expect(getTheme()).toBe('light')
  })
})

describe('cn', () => {
  // cn() merges CSS class names using clsx + tailwind-merge.
  // This is important because Tailwind classes can conflict (e.g., "p-2" and "p-4")
  // and tailwind-merge intelligently resolves conflicts by keeping the last one.

  it('merges multiple class names', () => {
    const result = cn('px-2', 'py-1', 'text-sm')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
    expect(result).toContain('text-sm')
  })

  it('resolves conflicting Tailwind classes (keeps the last one)', () => {
    const result = cn('p-2', 'p-4')
    expect(result).toBe('p-4')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('active-class')
  })

  it('filters out falsy values', () => {
    const result = cn('real-class', false, null, undefined, '', 'another-class')
    expect(result).toBe('real-class another-class')
  })
})

describe('getImageUrl', () => {
  // Since all images are now full Spotify CDN URLs, this function is a passthrough.
  // It exists for backward compatibility with older code that used local image paths.

  it('returns the image path as-is (Spotify URLs are already complete)', () => {
    const url = 'https://i.scdn.co/image/ab67616d0000b273abc123'
    expect(getImageUrl(url)).toBe(url)
  })

  it('returns empty string for empty input', () => {
    expect(getImageUrl('')).toBe('')
  })
})
