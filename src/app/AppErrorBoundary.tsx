import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  hasError: boolean
}

/**
 * Last line of defence so an unexpected render error shows a readable message
 * instead of a blank page (spec §41).
 *
 * The fallback deliberately uses no context and no translation lookup — it
 * has to work even when whatever failed is the thing that provides them — so
 * the copy is written out in both languages.
 */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[app] unexpected error', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
        <div className="flex max-w-sm flex-col gap-3">
          <p className="text-4xl" aria-hidden="true">
            ☕
          </p>
          <p lang="km" className="text-base font-semibold text-text">
            មិនអាចបង្ហាញម៉ឺនុយបានទេ។ សូមផ្ទុកទំព័រឡើងវិញ។
          </p>
          <p lang="en" className="text-sm text-muted">
            Unable to show the menu. Please refresh the page.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mx-auto mt-2 inline-flex min-h-11 items-center rounded-pill bg-primary px-5 text-sm font-medium text-on-primary"
          >
            <span lang="km">ផ្ទុកឡើងវិញ</span>
            <span className="mx-1.5 opacity-50">/</span>
            <span lang="en">Refresh</span>
          </button>
        </div>
      </div>
    )
  }
}
