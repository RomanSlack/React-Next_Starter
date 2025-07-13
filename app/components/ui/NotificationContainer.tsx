import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAppStore, Notification } from '@/lib/stores/app';
import { Button } from './Button';
import { cn } from '@/lib/utils';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useAppStore();
  
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-accent" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-destructive" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-accent/80" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-accent" />;
    }
  };
  
  const getBackgroundColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-accent/10 border-accent';
      case 'error':
        return 'bg-destructive/10 border-destructive';
      case 'warning':
        return 'bg-accent/5 border-accent/50';
      default:
        return 'bg-accent/10 border-accent';
    }
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'mb-3 p-4 rounded-lg border shadow-lg',
              getBackgroundColor(notification.type)
            )}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h4>
                <p className="mt-1 text-sm text-foreground">
                  {notification.message}
                </p>
                
                {notification.action && (
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={notification.action.onClick}
                      className="text-xs"
                    >
                      {notification.action.label}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id)}
                  icon={<XMarkIcon className="w-4 h-4" />}
                  className="text-gray-400 hover:text-muted-foreground"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { NotificationContainer };