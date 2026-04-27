import { useState } from 'react'

interface LoadingState {
  isLoading: boolean
  loadingMessage: string
  progress?: number
}

export const useLoading = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: '',
  })

  const startLoading = (message: string, progress?: number) => {
    setLoadingState({ isLoading: true, loadingMessage: message, progress })
  }

  const stopLoading = () => {
    setLoadingState({ isLoading: false, loadingMessage: '' })
  }

  const updateProgress = (progress: number) => {
    setLoadingState((prev) => ({ ...prev, progress }))
  }

  return { ...loadingState, startLoading, stopLoading, updateProgress }
}
