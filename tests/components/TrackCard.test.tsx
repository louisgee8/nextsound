/**
 * Component tests for TrackCard.
 *
 * KEY CONCEPTS:
 *
 * 1. React Testing Library Philosophy - Test components the way users interact
 *    with them, not by testing internal implementation details. Ask "what does
 *    the user see?" and "what happens when the user does X?" instead of
 *    "what's the component's internal state?"
 *
 * 2. render() - Renders a React component into a virtual DOM so we can query it.
 *
 * 3. screen - Provides query methods to find elements:
 *    - getByText() - finds element containing text (throws if not found)
 *    - getByAltText() - finds element by alt attribute (for images)
 *    - queryByText() - like getByText but returns null instead of throwing
 *
 * 4. Why component tests matter for interviews:
 *    Hiring managers look for this specifically. It shows you think about
 *    user-facing behavior, not just "does the code run."
 */
import { describe, it, expect } from 'vitest'
import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { TrackCard } from '@/components/ui/TrackCard'
import { AudioPlayerProvider } from '@/context/audioPlayerContext'
import type { ITrack } from '@/types'

/**
 * Custom render helper that wraps the component under test in
 * AudioPlayerProvider. TrackCard calls useAudioPlayerContext() which
 * throws if no provider is in the tree — a deliberate fail-loud guard.
 * Promote this to tests/test-utils.tsx if a second test file ever needs
 * the same wrapper.
 */
const renderWithAudio = (ui: ReactElement) => render(ui, { wrapper: AudioPlayerProvider })

// Test fixture - a realistic track object
const mockTrack: ITrack = {
  id: 'track-1',
  poster_path: 'https://i.scdn.co/image/ab67616d0000b273test',
  original_title: 'Blinding Lights',
  name: 'Blinding Lights',
  overview: 'The Weeknd',
  backdrop_path: 'https://i.scdn.co/image/ab67616d0000b273test',
  artist: 'The Weeknd',
  album: 'After Hours',
  duration: 200040, // 3:20 in milliseconds
  popularity: 95,
}

describe('TrackCard', () => {
  it('renders the track title', () => {
    renderWithAudio(<TrackCard track={mockTrack} category="popular" />)
    expect(screen.getByText('Blinding Lights')).toBeInTheDocument()
  })

  it('renders the artist name', () => {
    renderWithAudio(<TrackCard track={mockTrack} category="popular" />)
    expect(screen.getByText('The Weeknd')).toBeInTheDocument()
  })

  it('renders album art with correct alt text', () => {
    renderWithAudio(<TrackCard track={mockTrack} category="popular" />)
    const img = screen.getByAltText('Blinding Lights')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', mockTrack.poster_path)
  })

  it('shows album name in detailed variant', () => {
    renderWithAudio(<TrackCard track={mockTrack} category="popular" variant="detailed" />)
    expect(screen.getByText('After Hours')).toBeInTheDocument()
  })

  it('shows formatted duration in detailed variant', () => {
    renderWithAudio(<TrackCard track={mockTrack} category="popular" variant="detailed" />)
    // 200040ms = 3 minutes, 20 seconds = "3:20"
    expect(screen.getByText('3:20')).toBeInTheDocument()
  })

  it('does not show album/duration in compact variant', () => {
    renderWithAudio(<TrackCard track={mockTrack} category="popular" variant="compact" />)
    // In compact mode, the album and duration should not appear
    expect(screen.queryByText('After Hours')).not.toBeInTheDocument()
  })

  it('handles missing artist gracefully', () => {
    const trackNoArtist: ITrack = { ...mockTrack, artist: undefined }
    renderWithAudio(<TrackCard track={trackNoArtist} category="popular" />)
    expect(screen.getByText('Unknown Artist')).toBeInTheDocument()
  })

  it('handles missing title gracefully', () => {
    const trackNoTitle: ITrack = {
      ...mockTrack,
      original_title: '',
      name: '',
      title: '',
    }
    renderWithAudio(<TrackCard track={trackNoTitle} category="popular" />)
    expect(screen.getByText('Unknown Track')).toBeInTheDocument()
  })

  it('falls back to name when original_title is missing', () => {
    const trackNameOnly: ITrack = {
      ...mockTrack,
      original_title: '',
      name: 'Fallback Name',
    }
    renderWithAudio(<TrackCard track={trackNameOnly} category="popular" />)
    expect(screen.getByText('Fallback Name')).toBeInTheDocument()
  })
})
