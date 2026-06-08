import { cn } from '../../lib/utils';

function Card({ className, glass = false, gradient = false, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl',
        gradient ? 'gradient-border' : '',
        glass ? 'glass' : 'bg-surface-800 border border-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.45)]',
        'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }) {
  return <div className={cn('mb-4', className)} {...props}>{children}</div>;
}

function CardTitle({ className, children, ...props }) {
  return <h3 className={cn('text-lg font-semibold text-white', className)} {...props}>{children}</h3>;
}

function CardDescription({ className, children, ...props }) {
  return <p className={cn('text-sm text-gray-400 mt-1', className)} {...props}>{children}</p>;
}

function CardContent({ className, children, ...props }) {
  return <div className={cn('', className)} {...props}>{children}</div>;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
