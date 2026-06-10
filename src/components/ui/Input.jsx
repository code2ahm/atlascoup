import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-xs font-medium text-gray-300">{label}</label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-500" />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border bg-surface-900/50 px-3 py-2 max-sm:py-1.5 text-sm text-gray-100 placeholder:text-gray-600/40',
          'border-surface-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50',
          'transition-colors outline-none',
          Icon && 'pl-10',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
