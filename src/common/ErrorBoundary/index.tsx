import type { ErrorInfo, ReactNode } from 'react'
import React from 'react'
import { Link } from 'react-router-dom'
import { APIError, ErrorType } from '@/services/SpotifyAPI'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // In production, you could send this to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error while loading this content. Please try again or
              return to the home page.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
              <Link
                to="/"
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 inline-block"
              >
                Go Home
              </Link>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-sm text-xs overflow-auto text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// API-specific error boundary for handling API failures
interface APIErrorBoundaryProps {
  children: ReactNode
  onRetry?: () => void
}

interface APIErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class APIErrorBoundary extends React.Component<
  APIErrorBoundaryProps,
  APIErrorBoundaryState
> {
  constructor(props: APIErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): APIErrorBoundaryState {
    // Only catch API-related errors
    if (
      error instanceof APIError ||
      error.name === 'APIError' ||
      error.message.includes('API') ||
      error.message.includes('fetch')
    ) {
      return { hasError: true, error }
    }

    // Let other errors bubble up
    throw error
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error })

    if (import.meta.env.DEV) {
      console.error('API Error Boundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error
      const apiError = error instanceof APIError ? error : null

      // Determine error type and display details
      const getErrorDisplay = () => {
        if (apiError) {
          switch (apiError.type) {
            case ErrorType.NETWORK_ERROR:
              return { icon: '🌐', title: 'Connection Error', showRetry: true }
            case ErrorType.CORS_ERROR:
              return { icon: '🚫', title: 'Access Error', showRetry: true }
            case ErrorType.AUTH_ERROR:
              return { icon: '🔐', title: 'Authentication Error', showRetry: false }
            case ErrorType.RATE_LIMIT:
              return { icon: '⏱️', title: 'Rate Limited', showRetry: true }
            case ErrorType.TIMEOUT:
              return { icon: '⌛', title: 'Request Timeout', showRetry: true }
            case ErrorType.SERVER_ERROR:
              return { icon: '🔧', title: 'Server Error', showRetry: true }
            case ErrorType.CLIENT_ERROR:
              return { icon: '❌', title: 'Invalid Request', showRetry: false }
            case ErrorType.DATA_ERROR:
              return { icon: '📊', title: 'Data Error', showRetry: false }
            default:
              return { icon: '📡', title: 'API Error', showRetry: true }
          }
        }

        // Fallback for non-APIError instances
        const isNetworkError =
          error?.message.includes('Network') || error?.message.includes('fetch')
        const isAuthError =
          error?.message.includes('authentication') || error?.message.includes('401')

        return {
          icon: isNetworkError ? '🌐' : isAuthError ? '🔐' : '📡',
          title: isNetworkError
            ? 'Connection Error'
            : isAuthError
              ? 'Authentication Error'
              : 'API Error',
          showRetry: !isAuthError,
        }
      }

      const { icon, title, showRetry } = getErrorDisplay()
      const userMessage =
        apiError?.userMessage ||
        (error?.message.includes('Network')
          ? 'Please check your internet connection and try again.'
          : error?.message.includes('authentication')
            ? 'There was an issue with authentication. Please refresh the page.'
            : 'We encountered an error while fetching data.')

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{userMessage}</p>

          {/* Show retry after delay for rate limited requests */}
          {apiError?.type === ErrorType.RATE_LIMIT && apiError.retryAfter && (
            <p className="text-sm text-gray-500 mb-4">
              Please wait {Math.ceil(apiError.retryAfter / 1000)} seconds before retrying
            </p>
          )}

          {showRetry && (
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-sm transition-colors duration-200 disabled:bg-gray-400"
              disabled={
                !!(
                  apiError?.type === ErrorType.RATE_LIMIT &&
                  apiError.retryAfter &&
                  apiError.retryAfter > Date.now()
                )
              }
            >
              {apiError?.type === ErrorType.RATE_LIMIT ? 'Retry After Delay' : 'Retry'}
            </button>
          )}

          {import.meta.env.DEV && error && (
            <details className="mt-4 text-left max-w-lg">
              <summary className="cursor-pointer text-sm text-gray-500">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-sm text-xs overflow-auto text-red-600 dark:text-red-400">
                {apiError
                  ? JSON.stringify(
                      {
                        type: apiError.type,
                        status: apiError.status,
                        code: apiError.code,
                        message: apiError.message,
                        userMessage: apiError.userMessage,
                        retryable: apiError.retryable,
                        retryAfter: apiError.retryAfter,
                        context: apiError.context,
                      },
                      null,
                      2,
                    )
                  : error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
