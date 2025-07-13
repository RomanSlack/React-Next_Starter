'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Avatar } from '@/app/components/ui/Avatar';
import {
  UserIcon,
  BellIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/app/lib/stores/auth';
import { useThemeStore } from '@/app/lib/stores/theme';
import ClearAccountDataModal from '@/app/components/settings/ClearAccountDataModal';

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { theme, accentColor, setTheme, setAccentColor } = useThemeStore();
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  
  const accentColors = [
    { name: 'Grape', value: 'grape', color: 'bg-grape-500' },
    { name: 'Apple', value: 'apple', color: 'bg-apple-500' },
    { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
    { name: 'Berry', value: 'berry', color: 'bg-berry-500' },
    { name: 'Peach', value: 'peach', color: 'bg-peach-500' },
  ];
  
  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        
        {/* Profile Settings */}
        <Card>
          <CardHeader
            title="Profile"
            subtitle="Update your personal information"
            action={
              <UserIcon className="w-5 h-5 text-gray-400" />
            }
          />
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar
                  src={user?.avatar_url}
                  name={user?.full_name || user?.email || 'User'}
                  size="xl"
                />
                <div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  defaultValue={user?.full_name || ''}
                />
                <Input
                  label="Username"
                  defaultValue={user?.username || ''}
                />
                <Input
                  label="Email"
                  type="email"
                  defaultValue={user?.email || ''}
                />
              </div>
              
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Appearance Settings */}
        <Card>
          <CardHeader
            title="Appearance"
            subtitle="Customize how Skema looks and feels"
            action={
              <PaintBrushIcon className="w-5 h-5 text-gray-400" />
            }
          />
          <CardContent>
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'system'].map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() => setTheme(themeOption as any)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        theme === themeOption
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className="capitalize font-medium">{themeOption}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Accent Color */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Accent Color
                </label>
                <div className="flex space-x-3">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAccentColor(color.value as any)}
                      className={`w-10 h-10 rounded-lg ${color.color} transition-transform ${
                        accentColor === color.value
                          ? 'scale-110 ring-2 ring-offset-2 ring-gray-400'
                          : 'hover:scale-105'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <CardHeader
            title="Notifications"
            subtitle="Configure how you want to be notified"
            action={
              <BellIcon className="w-5 h-5 text-gray-400" />
            }
          />
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Email notifications', description: 'Receive notifications via email' },
                { name: 'Push notifications', description: 'Receive push notifications in your browser' },
                { name: 'Desktop notifications', description: 'Show desktop notifications when app is open' },
                { name: 'Task reminders', description: 'Get reminded about upcoming tasks' },
                { name: 'Calendar reminders', description: 'Get reminded about calendar events' },
                { name: 'Journal reminders', description: 'Daily reminders to write in your journal' },
              ].map((setting) => (
                <div key={setting.name} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{setting.name}</h4>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-accent focus:ring-accent border-border rounded"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Security Settings */}
        <Card>
          <CardHeader
            title="Security"
            subtitle="Manage your account security"
            action={
              <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
            }
          />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Two-factor authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Active sessions</h4>
                  <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                </div>
                <Button variant="outline" size="sm">
                  View Sessions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Danger Zone */}
        <Card variant="outlined">
          <CardHeader
            title="Danger Zone"
            subtitle="Irreversible and destructive actions"
          />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-red-900">Export your data</h4>
                  <p className="text-sm text-muted-foreground">Download a copy of all your data</p>
                </div>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-red-900">Clear all account data</h4>
                  <p className="text-sm text-muted-foreground">Delete all boards, calendar events, journal entries, and AI history</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowClearDataModal(true)}
                >
                  Clear All Data
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-red-900">Delete account</h4>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Clear Account Data Modal */}
      <ClearAccountDataModal 
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
      />
    </AppLayout>
  );
};

export default SettingsPage;