import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  className,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  
  const colors = {
    primary: 'text-grape-600',
    secondary: 'text-muted-foreground',
    white: 'text-white',
    gray: 'text-gray-400',
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };
  
  const renderSpinner = () => (
    <svg
      className={cn('animate-spin', sizes[size], colors[color])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
  
  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'rounded-full',
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
            colors[color].replace('text-', 'bg-')
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
  
  const renderBars = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'rounded-sm',
            size === 'sm' ? 'w-1 h-3' : size === 'md' ? 'w-1 h-4' : size === 'lg' ? 'w-2 h-6' : 'w-2 h-8',
            colors[color].replace('text-', 'bg-')
          )}
          animate={{
            scaleY: [1, 2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
  
  const renderPulse = () => (
    <motion.div
      className={cn(
        'rounded-full',
        sizes[size],
        colors[color].replace('text-', 'bg-')
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    />
  );
  
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'bars':
        return renderBars();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };
  
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {renderLoader()}
      {text && (
        <p className={cn('mt-2 font-medium', textSizes[size], colors[color])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Loading Skeleton Component
interface SkeletonProps {
  className?: string;
  lines?: number;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  lines = 1,
  width = '100%',
  height = 'auto',
  variant = 'text',
}) => {
  const baseStyles = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    text: 'h-4 rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };
  
  const getHeight = () => {
    if (height !== 'auto') return height;
    if (variant === 'text') return '1rem';
    return '2rem';
  };
  
  if (lines === 1) {
    return (
      <div
        className={cn(baseStyles, variants[variant], className)}
        style={{ width, height: getHeight() }}
      />
    );
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(baseStyles, variants[variant])}
          style={{
            width: i === lines - 1 ? '75%' : width,
            height: getHeight(),
          }}
        />
      ))}
    </div>
  );
};

// Loading Overlay Component
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  children: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text,
  className,
  children,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
};

export { Loading, Skeleton, LoadingOverlay };
export type { LoadingProps, SkeletonProps, LoadingOverlayProps };