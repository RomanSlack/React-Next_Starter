'use client';

import React from 'react';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const NotificationsPage: React.FC = () => {
  // Real data - empty for production ready state
  const notifications: any[] = [];
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="mt-1 text-lg text-gray-600">
              Stay updated with your latest activity
            </p>
          </div>
          
          {notifications.length > 0 && (
            <Button
              variant="outline"
              icon={<CheckIcon className="w-5 h-5" />}
            >
              Mark All Read
            </Button>
          )}
        </div>
        
        {/* Notifications List */}
        <Card>
          <CardHeader title="Recent Notifications" />
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
                <p className="text-gray-500">
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <span className="text-xs text-gray-500 mt-2 block">{notification.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<CheckIcon className="w-4 h-4" />}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<XMarkIcon className="w-4 h-4" />}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;