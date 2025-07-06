import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  RectangleStackIcon,
  CalendarIcon,
  BookOpenIcon,
  CogIcon,
  CommandLineIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores/app';
import { useAuthStore } from '@/lib/stores/auth';
import { Avatar } from '@/app/components/ui/Avatar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Boards', href: '/boards', icon: RectangleStackIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Journal', href: '/journal', icon: BookOpenIcon },
  { name: 'AI Assistant', href: '/ai', icon: CommandLineIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, hasHydrated } = useAppStore();
  const { user } = useAuthStore();
  
  // Desktop: default open until hydrated, Mobile: default closed
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const defaultState = isDesktop;
  const actualSidebarOpen = hasHydrated ? sidebarOpen : defaultState;
  
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };
  
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: actualSidebarOpen ? 256 : 72,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-30"
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <motion.div
            initial={false}
            animate={{
              opacity: actualSidebarOpen ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-grape-500 to-grape-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            {actualSidebarOpen && (
              <span className="text-xl font-bold text-gray-900">Skema</span>
            )}
          </motion.div>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {actualSidebarOpen ? (
              <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative',
                      active
                        ? 'bg-grape-50 text-grape-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0',
                        active ? 'text-grape-500' : 'text-gray-500'
                      )}
                    />
                    
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: actualSidebarOpen ? 1 : 0,
                        x: actualSidebarOpen ? 0 : -10,
                      }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'ml-3 truncate',
                        !actualSidebarOpen && 'sr-only'
                      )}
                    >
                      {item.name}
                    </motion.span>
                    
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-grape-50 rounded-md -z-10"
                        initial={false}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar
              src={user?.avatar_url}
              name={user?.full_name || 'User'}
              size="md"
            />
            
            <motion.div
              initial={false}
              animate={{
                opacity: actualSidebarOpen ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex-1 min-w-0',
                !actualSidebarOpen && 'sr-only'
              )}
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'Loading...'}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Mobile Sidebar Overlay */}
      {actualSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: actualSidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-grape-500 to-grape-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Skema</span>
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      active
                        ? 'bg-grape-50 text-grape-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0',
                        active ? 'text-grape-500' : 'text-gray-500'
                      )}
                    />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar
              src={user?.avatar_url}
              name={user?.full_name || 'User'}
              size="md"
            />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export { Sidebar };