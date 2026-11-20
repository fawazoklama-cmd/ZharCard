import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'Unexpected error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#DDF3FF] dark:bg-[#101C32] p-6">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-[#162644] border border-[#75C9FF]/40 p-6 shadow-xl text-center">
            <h2 className="text-xl font-bold text-[#101C32] dark:text-white mb-2 font-display">
              ZharWorld Encountered an Issue
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.href = '/';
              }}
              className="px-5 py-2.5 rounded-xl bg-[#2377B9] hover:bg-[#1b6199] text-white font-semibold text-sm transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
