import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6 rounded-xl bg-surface-container border border-error/30 text-center gap-3">
          <span className="material-symbols-outlined text-error text-[32px]">error</span>
          <p className="text-[13px] text-on-surface-variant">Something went wrong in this section.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-[11px] uppercase tracking-widest font-bold text-primary hover:opacity-80 transition-all"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
