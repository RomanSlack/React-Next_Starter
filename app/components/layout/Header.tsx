import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  CommandLineIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Avatar } from '@/app/components/ui/Avatar';
import { useAppStore } from '@/lib/stores/app';
import { useAuthStore } from '@/lib/stores/auth';
import { useThemeStore } from '@/lib/stores/theme';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    setCommandBarOpen,
    searchQuery,
    setSearchQuery,
    notifications 
  } = useAppStore();
  
  const { user, logout } = useAuthStore();
  const { theme, setTheme, toggleTheme } = useThemeStore();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="w-5 h-5" />;
      case 'dark':
        return <MoonIcon className="w-5 h-5" />;
      default:
        return <ComputerDesktopIcon className="w-5 h-5" />;
    }
  };
  
  const unreadNotifications = (notifications || []).filter(n => !n.read).length;
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 fixed top-0 right-0 left-0 md:left-64 z-20">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            icon={<Bars3Icon className="w-5 h-5" />}
          />
          
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <div
              className={cn(
                'flex items-center transition-all duration-200',
                searchFocused ? 'w-80' : 'w-64'
              )}
            >
              <Input
                type="text"
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                className="pr-20"
              />
              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
                  ⌘K
                </kbd>
              </div>
            </div>
          </form>
        </div>
        
        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* AI Command Bar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommandBarOpen(true)}
            icon={<CommandLineIcon className="w-5 h-5" />}
            className="hidden sm:flex"
          />
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            icon={getThemeIcon()}
          />
          
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon={<BellIcon className="w-5 h-5" />}
              onClick={() => router.push('/notifications')}
            />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </div>
          
          {/* User Menu */}
          <div className="relative group">
            <Avatar
              src={user?.avatar_url}
              name={user?.full_name || 'User'}
              size="sm"
              className="cursor-pointer"
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'Loading...'}
                  </p>
                </div>
                
                <button
                  onClick={() => router.push('/settings')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Profile Settings
                </button>
                
                <button
                  onClick={() => router.push('/settings')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Preferences
                </button>
                
                <div className="border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };