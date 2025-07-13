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
    const baseStyles = 'block w-full px-3 py-2 text-sm placeholder-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      default: 'border border-border rounded-md bg-background text-foreground focus:ring-accent focus:border-accent',
      filled: 'border border-transparent rounded-md bg-muted text-foreground focus:ring-accent focus:bg-background focus:border-accent',
      outline: 'border-2 border-border rounded-md bg-transparent text-foreground focus:ring-accent focus:border-accent',
    };
    
    const errorStyles = error ? 'border-destructive focus:ring-destructive focus:border-destructive' : '';
    
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
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <span className="text-muted-foreground sm:text-sm">{icon}</span>
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
              <span className="text-muted-foreground sm:text-sm">{icon}</span>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
        
        {hint && !error && (
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };