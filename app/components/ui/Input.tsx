import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outline';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    hint,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    variant = 'default',
    disabled,
    ...props
  }, ref) => {
    // Remove custom props from inputProps to avoid passing them to DOM
    const inputProps = props;
    const baseStyles = 'block w-full px-3 py-2 text-sm placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      default: 'border border-gray-300 rounded-md bg-white focus:ring-grape-500 focus:border-grape-500',
      filled: 'border border-transparent rounded-md bg-gray-100 focus:ring-grape-500 focus:bg-white focus:border-grape-500',
      outline: 'border-2 border-gray-300 rounded-md bg-transparent focus:ring-grape-500 focus:border-grape-500',
    };
    
    const errorStyles = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';
    
    const inputClasses = cn(
      baseStyles,
      variants[variant],
      errorStyles,
      icon && iconPosition === 'left' && 'pl-10',
      icon && iconPosition === 'right' && 'pr-10',
      fullWidth && 'w-full',
      className
    );
    
    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <span className="text-gray-400 sm:text-sm">{icon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            className={inputClasses}
            disabled={disabled}
            {...inputProps}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-400 sm:text-sm">{icon}</span>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };