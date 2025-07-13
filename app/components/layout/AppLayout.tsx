import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { CommandBar } from '@/app/components/ai/CommandBar';
import { NotificationContainer } from '@/app/components/ui/NotificationContainer';
import { useAuthStore } from '@/lib/stores/auth';
import { useAppStore } from '@/lib/stores/app';
import { queryClient } from '@/lib/query/client';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { sidebarOpen } = useAppStore();
  
  // Only show React Query DevTools in development when explicitly enabled
  const showRQDevtools = process.env.NEXT_PUBLIC_SHOW_RQ_DEVTOOLS === 'true';
  
  useEffect(() => {
    // Only redirect after initialization is complete
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, isInitialized, router]);
  
  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Don't render anything if not authenticated after initialization
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div
          className={cn(
            'transition-all duration-300',
            'md:ml-64'
          )}
        >
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <main className={cn('pt-16 min-h-screen', className)}>
            {children}
          </main>
        </div>
        
        {/* Global Components */}
        <CommandBar />
        <NotificationContainer />
      </div>
      
      {/* React Query DevTools - Only show when explicitly enabled */}
      {showRQDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export { AppLayout };