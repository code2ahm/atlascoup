import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#050811] flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <pre className="text-sm text-gray-400 bg-black/30 rounded-lg p-4 overflow-auto max-h-60 mb-4">
              {this.state.error.message}
            </pre>
            <p className="text-sm text-gray-500 mb-4">Stack trace:</p>
            <pre className="text-xs text-gray-600 bg-black/30 rounded-lg p-4 overflow-auto max-h-40">
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
              className="mt-6 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb]"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
