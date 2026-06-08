import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Select = forwardRef(({ className, label, error, options = [], placeholder, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-gray-300">{label}</label>
    )}
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg border bg-surface-900/50 px-3 py-2.5 text-sm text-gray-100',
        'border-surface-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50',
        'transition-colors outline-none',
        error && 'border-red-500',
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));

Select.displayName = 'Select';
export default Select;
