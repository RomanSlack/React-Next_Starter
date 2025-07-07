import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  CalendarIcon,
  BookOpenIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Avatar } from '@/app/components/ui/Avatar';
import { useAppStore } from '@/lib/stores/app';
import { useAuthStore } from '@/lib/stores/auth';
import { useThemeStore } from '@/lib/stores/theme';
import { searchAPI, SearchSuggestion } from '@/app/lib/api/search';
import { cn } from '@/lib/utils';
import { debounce } from '@/app/lib/utils/debounce';

const Header: React.FC = () => {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Debounced suggestions fetch
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length > 0) {
        try {
          const response = await searchAPI.getSuggestions(query.trim());
          setSuggestions(response.suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  // Handle search query changes
  useEffect(() => {
    if (searchFocused) {
      fetchSuggestions(searchQuery);
    }
  }, [searchQuery, searchFocused, fetchSuggestions]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchFocused(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const performSearch = (suggestion?: string) => {
    const query = suggestion || searchQuery.trim();
    if (query) {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedSuggestion >= 0) {
          e.preventDefault();
          const suggestion = suggestions[selectedSuggestion];
          setSearchQuery(suggestion.text);
          performSearch(suggestion.text);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'board':
        return <RectangleStackIcon className="w-4 h-4 text-blue-500" />;
      case 'tag':
        return <TagIcon className="w-4 h-4 text-purple-500" />;
      case 'event':
        return <CalendarIcon className="w-4 h-4 text-green-500" />;
      case 'journal':
        return <BookOpenIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />;
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
          <div ref={searchRef} className="relative">
            <form onSubmit={handleSearch}>
              <div
                className={cn(
                  'flex items-center transition-all duration-200',
                  searchFocused ? 'w-80' : 'w-64'
                )}
              >
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setSearchFocused(true);
                    if (searchQuery.trim()) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setSearchFocused(false);
                    // Delay hiding suggestions to allow for clicks
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  onKeyDown={handleKeyDown}
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

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                <div className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.text}-${index}`}
                      onClick={() => {
                        setSearchQuery(suggestion.text);
                        performSearch(suggestion.text);
                      }}
                      className={cn(
                        'w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors',
                        selectedSuggestion === index && 'bg-grape-50 text-grape-700'
                      )}
                    >
                      {getSuggestionIcon(suggestion.type)}
                      <span className="flex-1 text-sm">{suggestion.text}</span>
                      <span className="text-xs text-gray-400 capitalize">{suggestion.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* AI Mode */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/ai-mode')}
            icon={<SparklesIcon className="w-5 h-5" />}
            className="hidden sm:flex text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            title="AI Mode"
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