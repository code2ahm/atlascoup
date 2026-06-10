import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-screen bg-[#050811] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-[#4facfe]">?</span>
        </div>
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-lg text-[#94a3b8] mb-2">Page not found</p>
        <p className="text-sm text-[#64748b] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#4facfe] to-[#2563eb] hover:from-[#3d8ee0] hover:to-[#1d4ed8] shadow-lg shadow-[#4facfe]/20 transition-all duration-200"
          >
            <Home className="h-4 w-4" /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-[#94a3b8] border border-white/10 hover:border-[#4facfe]/50 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
