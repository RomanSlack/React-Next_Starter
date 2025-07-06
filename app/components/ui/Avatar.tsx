import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  name?: string;
  className?: string;
  fallbackColor?: 'primary' | 'secondary' | 'random';
  status?: 'online' | 'offline' | 'away' | 'busy';
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  name,
  className,
  fallbackColor = 'random',
  status,
  onClick,
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };
  
  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  };
  
  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const getRandomColor = (name: string) => {
    if (fallbackColor === 'primary') return 'bg-grape-500';
    if (fallbackColor === 'secondary') return 'bg-gray-500';
    
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-cyan-500',
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };
  
  const displayName = alt || name || 'User';
  const initials = name ? getInitials(name) : '?';
  const fallbackBg = name ? getRandomColor(name) : 'bg-gray-500';
  
  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center',
          sizes[size],
          onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
          !src && `${fallbackBg} text-white font-medium`
        )}
        onClick={onClick}
      >
        {src ? (
          <img
            src={src}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on error to show fallback
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className={cn('select-none', textSizes[size])}>
            {initials}
          </span>
        )}
      </div>
      
      {status && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            statusSizes[size],
            getStatusColor(status)
          )}
        />
      )}
    </div>
  );
};

// Avatar Group Component
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    alt?: string;
    name?: string;
  }>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  max?: number;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size = 'md',
  max = 4,
  className,
  spacing = 'normal',
}) => {
  const spacings = {
    tight: '-ml-2',
    normal: '-ml-3',
    loose: '-ml-4',
  };
  
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;
  
  return (
    <div className={cn('flex items-center', className)}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'ring-2 ring-white rounded-full',
            index > 0 && spacings[spacing]
          )}
        >
          <Avatar
            src={avatar.src}
            alt={avatar.alt}
            name={avatar.name}
            size={size}
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={cn(
            'ring-2 ring-white rounded-full',
            spacings[spacing]
          )}
        >
          <Avatar
            name={`+${remainingCount}`}
            size={size}
            fallbackColor="secondary"
          />
        </div>
      )}
    </div>
  );
};

export { Avatar, AvatarGroup };
export type { AvatarProps, AvatarGroupProps };