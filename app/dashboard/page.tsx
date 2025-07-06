'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Loading';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  RectangleStackIcon,
  BookOpenIcon,
  ChartBarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/stores/auth';
import { cn } from '@/lib/utils/cn';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  
  // Mock data - this would come from APIs
  const stats = {
    totalBoards: 12,
    totalCards: 84,
    completedCards: 67,
    upcomingEvents: 5,
    journalEntries: 23,
    productivityScore: 87,
  };
  
  const recentBoards = [
    { id: '1', title: 'Website Redesign', color: 'bg-blue-500', members: 4 },
    { id: '2', title: 'Marketing Campaign', color: 'bg-green-500', members: 3 },
    { id: '3', title: 'Product Launch', color: 'bg-purple-500', members: 6 },
  ];
  
  const upcomingTasks = [
    { id: '1', title: 'Review design mockups', dueDate: '2024-01-15', board: 'Website Redesign' },
    { id: '2', title: 'Prepare presentation', dueDate: '2024-01-16', board: 'Marketing Campaign' },
    { id: '3', title: 'Test new features', dueDate: '2024-01-17', board: 'Product Launch' },
  ];
  
  const upcomingEvents = [
    { id: '1', title: 'Team Meeting', date: '2024-01-15', time: '10:00 AM' },
    { id: '2', title: 'Client Call', date: '2024-01-16', time: '2:00 PM' },
    { id: '3', title: 'Project Review', date: '2024-01-17', time: '3:30 PM' },
  ];
  
  const recentJournalEntries = [
    { id: '1', title: 'Productive Monday', date: '2024-01-14', mood: 'great' },
    { id: '2', title: 'Learning New Technologies', date: '2024-01-13', mood: 'good' },
    { id: '3', title: 'Weekend Reflections', date: '2024-01-12', mood: 'okay' },
  ];
  
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'okay': return 'bg-yellow-500';
      case 'bad': return 'bg-orange-500';
      case 'terrible': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || 'User'}!
            </h1>
            <p className="mt-1 text-lg text-gray-600">
              Here's what's happening with your projects today.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              icon={<PlusIcon className="w-5 h-5" />}
              className="bg-grape-600 hover:bg-grape-700"
            >
              Quick Add
            </Button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <RectangleStackIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Boards</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBoards}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedCards}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Productivity Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.productivityScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Boards */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Recent Boards"
              action={
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {recentBoards.map((board) => (
                  <div
                    key={board.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', board.color)}>
                        <RectangleStackIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{board.title}</h3>
                        <p className="text-sm text-gray-500">{board.members} members</p>
                      </div>
                    </div>
                    
                    <AvatarGroup
                      avatars={Array.from({ length: board.members }, (_, i) => ({
                        name: `User ${i + 1}`,
                      }))}
                      max={3}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader
              title="Upcoming Tasks"
              action={
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">{task.board}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {task.dueDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader
              title="Upcoming Events"
              action={
                <Button variant="ghost" size="sm">
                  View Calendar
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-grape-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Journal Entries */}
          <Card>
            <CardHeader
              title="Recent Journal Entries"
              action={
                <Button variant="ghost" size="sm">
                  View Journal
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {recentJournalEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center space-x-3">
                    <div className={cn('w-3 h-3 rounded-full flex-shrink-0', getMoodColor(entry.mood))}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entry.title}
                      </p>
                      <p className="text-xs text-gray-500">{entry.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;