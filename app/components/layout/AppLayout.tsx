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
  const { isAuthenticated } = useAuthStore();
  const { sidebarCollapsed } = useAppStore();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router]);
  
  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
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
      
      {/* React Query DevTools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export { AppLayout };