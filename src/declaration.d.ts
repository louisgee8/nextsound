declare module '*.webp'
declare module '*.svg' {
  const content: string
  export default content
}

// Extend Vitest's expect with jest-dom matchers
/// <reference types="@testing-library/jest-dom" />
