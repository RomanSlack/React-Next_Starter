'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Avatar, AvatarGroup } from '@/app/components/ui/Avatar';
import { Skeleton } from '@/app/components/ui/Loading';
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
import { cn } from '@/lib/utils';
import { boardsAPI } from '@/app/lib/api/boards';
import { calendarAPI } from '@/app/lib/api/calendar';
import { journalAPI } from '@/app/lib/api/journal';
import { Board, CalendarEvent, JournalEntry } from '@/types';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalBoards: 0,
    totalCards: 0,
    completedCards: 0,
    upcomingEvents: 0,
    journalEntries: 0,
    productivityScore: 0,
  });
  
  const [recentBoards, setRecentBoards] = useState<Board[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [recentJournalEntries, setRecentJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [boardsResponse, eventsResponse, journalResponse, journalStatsResponse] = await Promise.allSettled([
        boardsAPI.getBoards(1, 5),
        calendarAPI.getUpcomingEvents(5),
        journalAPI.getEntries(1, 5),
        journalAPI.getStats()
      ]);

      // Process boards data
      if (boardsResponse.status === 'fulfilled') {
        const boards = boardsResponse.value.items || [];
        setRecentBoards(boards);
        setStats(prev => ({ ...prev, totalBoards: boards.length }));
      }

      // Process events data
      if (eventsResponse.status === 'fulfilled') {
        const events = eventsResponse.value || [];
        setUpcomingEvents(events);
        setStats(prev => ({ ...prev, upcomingEvents: events.length }));
      }

      // Process journal data
      if (journalResponse.status === 'fulfilled') {
        const entries = journalResponse.value.items || [];
        setRecentJournalEntries(entries);
      }

      if (journalStatsResponse.status === 'fulfilled') {
        const journalStats = journalStatsResponse.value;
        setStats(prev => ({ 
          ...prev, 
          journalEntries: journalStats.total_entries || 0,
          productivityScore: Math.min(100, (journalStats.streak_days || 0) * 10)
        }));
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = () => {
    // Simple modal or dropdown could be implemented here
    // For now, redirect to boards page
    router.push('/boards');
  };

  const handleCreateBoard = async () => {
    try {
      await boardsAPI.createBoard({
        title: 'New Board',
        description: 'Add a description for your board',
        color: 'bg-blue-500'
      });
      router.push('/boards');
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const upcomingTasks: any[] = []; // This would come from cards API
  
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
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="mt-1 text-lg text-gray-600">
              Here's what's happening with your projects today.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              icon={<PlusIcon className="w-5 h-5" />}
              className="bg-grape-600 hover:bg-grape-700"
              onClick={handleQuickAdd}
              disabled={loading}
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
                <Button variant="ghost" size="sm" onClick={() => router.push('/boards')}>
                  View All
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {recentBoards.length === 0 ? (
                  <div className="text-center py-8">
                    <RectangleStackIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No boards yet</p>
                    <p className="text-sm text-gray-400">Create your first board to get started</p>
                    <Button 
                      className="mt-4 bg-grape-600 hover:bg-grape-700"
                      size="sm"
                      onClick={handleCreateBoard}
                      disabled={loading}
                    >
                      Create Board
                    </Button>
                  </div>
                ) : (
                  recentBoards.map((board) => (
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader
              title="Upcoming Tasks"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push('/boards')}>
                  View All
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-3">
                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No upcoming tasks</p>
                    <p className="text-sm text-gray-400">Create boards and add cards to see tasks here</p>
                  </div>
                ) : (
                  upcomingTasks.map((task) => (
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
                  ))
                )}
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
                <Button variant="ghost" size="sm" onClick={() => router.push('/calendar')}>
                  View Calendar
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No upcoming events</p>
                    <p className="text-sm text-gray-400">Schedule events to see them here</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => {
                    const eventDate = new Date(event.start_datetime);
                    const dateStr = eventDate.toLocaleDateString();
                    const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={event.id} className="flex items-center space-x-3">
                        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', event.color || 'bg-grape-500')}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dateStr} at {timeStr}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Journal Entries */}
          <Card>
            <CardHeader
              title="Recent Journal Entries"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push('/journal')}>
                  View Journal
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-4">
                {recentJournalEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No journal entries</p>
                    <p className="text-sm text-gray-400">Start journaling to track your thoughts and mood</p>
                  </div>
                ) : (
                  recentJournalEntries.map((entry) => {
                    const entryDate = new Date(entry.entry_date || entry.created_at);
                    const dateStr = entryDate.toLocaleDateString();
                    
                    return (
                      <div key={entry.id} className="flex items-center space-x-3">
                        <div className={cn('w-3 h-3 rounded-full flex-shrink-0', getMoodColor(entry.mood || 'okay'))}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {entry.title}
                          </p>
                          <p className="text-xs text-gray-500">{dateStr}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;