'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  BookOpenIcon,
  TrophyIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/stores/auth';
import { cn } from '@/lib/utils';
import { questAPI, Quest, QuestDay } from '@/app/lib/api/quest';
import { calendarAPI } from '@/app/lib/api/calendar';
import { journalAPI } from '@/app/lib/api/journal';
import { CalendarEvent, JournalEntry } from '@/types';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalQuests: 0,
    completedQuests: 0,
    pendingQuests: 0,
    upcomingEvents: 0,
    journalEntries: 0,
  });
  
  const [todayQuests, setTodayQuests] = useState<Quest[]>([]);
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
      const [questsResponse, eventsResponse, journalResponse, journalStatsResponse] = await Promise.allSettled([
        questAPI.getTodayQuests(),
        calendarAPI.getUpcomingEvents(5),
        journalAPI.getEntries(1, 5),
        journalAPI.getStats()
      ]);

      // Process quests data
      if (questsResponse.status === 'fulfilled') {
        const questDay = questsResponse.value;
        setTodayQuests(questDay.quests || []);
        setStats(prev => ({ 
          ...prev, 
          totalQuests: questDay.total_count || 0,
          completedQuests: questDay.completed_count || 0,
          pendingQuests: questDay.pending_count || 0
        }));
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
          journalEntries: journalStats.total_entries || 0
        }));
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = () => {
    // Redirect to quest page for quick task creation
    router.push('/quest');
  };

  const handleToggleQuest = async (questId: string, isComplete: boolean) => {
    try {
      await questAPI.toggleQuestComplete(questId, isComplete);
      await fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle quest:', error);
    }
  };

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
              Here's your quest progress and what's planned for today.
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
                    <ListBulletIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Quests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuests}</p>
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
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedQuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent padding="lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingQuests}</p>
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
                  <p className="text-sm font-medium text-gray-600">Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Quests */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Today's Quests"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push('/quest')}>
                  View All
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-3">
                {todayQuests.length === 0 ? (
                  <div className="text-center py-8">
                    <ListBulletIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No quests for today</p>
                    <p className="text-sm text-gray-400">Add your first quest to get started</p>
                    <Button 
                      className="mt-4 bg-grape-600 hover:bg-grape-700"
                      size="sm"
                      onClick={() => router.push('/quest')}
                      disabled={loading}
                    >
                      Add Quest
                    </Button>
                  </div>
                ) : (
                  todayQuests.slice(0, 6).map((quest) => (
                    <div
                      key={quest.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <button
                        onClick={() => handleToggleQuest(quest.id, !quest.is_complete)}
                        className={cn(
                          'w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                          quest.is_complete
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        )}
                      >
                        {quest.is_complete && (
                          <CheckCircleIcon className="w-3 h-3" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          quest.is_complete 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-900'
                        )}>
                          {quest.content}
                        </p>
                        {quest.date_due && (
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            Due: {new Date(quest.date_due).toLocaleDateString()}
                            {quest.time_due && ` at ${quest.time_due}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Pending Quests */}
          <Card>
            <CardHeader
              title="Pending Quests"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push('/quest')}>
                  View All
                </Button>
              }
            />
            <CardContent>
              <div className="space-y-3">
                {todayQuests.filter(q => !q.is_complete).length === 0 ? (
                  <div className="text-center py-8">
                    <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">All done!</p>
                    <p className="text-sm text-gray-400">Great job completing all your quests</p>
                  </div>
                ) : (
                  todayQuests
                    .filter(q => !q.is_complete)
                    .slice(0, 5)
                    .map((quest) => (
                      <div key={quest.id} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-gray-200 rounded border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {quest.content}
                          </p>
                          {quest.date_due && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              Due: {new Date(quest.date_due).toLocaleDateString()}
                              {quest.time_due && ` at ${quest.time_due}`}
                            </p>
                          )}
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