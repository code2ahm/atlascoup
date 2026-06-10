import { cn } from '../../lib/utils';

function LoadingSpinner({ size = 'md', className }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-surface-600 border-t-primary-500',
        sizes[size]
      )} />
    </div>
  );
}

function LoadingSkeleton({ className }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-surface-700/50', className)} />
  );
}

function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0e1219]">
      <div className="relative w-10 h-10 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-[#4facfe] animate-spin" />
      </div>
      <p className="text-sm text-gray-400 text-center max-w-[220px] leading-relaxed">
        Loading your app. This may take a few seconds.
        <br />
        <span className="text-gray-600 text-xs">
          If you are stuck here for more than 30s please refresh.
        </span>
      </p>
    </div>
  );
}

export { LoadingSpinner, LoadingSkeleton, PageLoader };
