import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary-400/15 hover:bg-primary-400/25 text-primary-300 border border-primary-400/20 shadow-lg shadow-primary-400/10',
  secondary: 'bg-white/8 hover:bg-white/15 text-gray-200 border border-white/5',
  ghost: 'hover:bg-primary-400/10 text-gray-400 hover:text-primary-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20',
  outline: 'border border-primary-400/30 hover:border-primary-400/50 text-primary-300 hover:text-primary-200 hover:bg-primary-400/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm max-sm:px-4 max-sm:py-2 max-sm:text-xs',
};

const Button = forwardRef(({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
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
