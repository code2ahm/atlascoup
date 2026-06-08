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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export { LoadingSpinner, LoadingSkeleton, PageLoader };
