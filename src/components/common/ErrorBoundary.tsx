import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-brand-dark/5 shadow-xl text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h2 className="text-3xl font-serif text-brand-dark mb-4">Something went wrong</h2>
            <p className="text-brand-dark/60 mb-8">
              We encountered an unexpected error while rendering this page.
              {this.state.error && (
                <span className="block mt-2 text-xs font-mono bg-brand-cream p-2 rounded-lg overflow-auto max-h-24">
                  {this.state.error.message}
                </span>
              )}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-dark text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
