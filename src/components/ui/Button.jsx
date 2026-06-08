import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gradient-to-r from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40',
  secondary: 'bg-surface-700 hover:bg-surface-600 text-gray-200',
  ghost: 'hover:bg-surface-800 text-gray-400 hover:text-gray-200',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  outline: 'border border-surface-600 hover:border-primary-500 text-gray-300 hover:text-primary-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef(({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
));

Button.displayName = 'Button';
export default Button;
