'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { calendarAPI } from '@/app/lib/api/calendar';
import { CalendarEvent } from '@/types';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get events for the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await calendarAPI.getEvents(
        1, 100, 
        startOfMonth.toISOString(), 
        endOfMonth.toISOString()
      );
      setEvents(response.items || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const now = new Date();
      const eventStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      const newEvent = await calendarAPI.createEvent({
        title: 'New Event',
        description: 'Add details for your event',
        start_datetime: eventStart.toISOString(),
        end_datetime: eventEnd.toISOString(),
        color: 'bg-blue-500',
        is_all_day: false,
        is_recurring: false
      });
      
      setEvents([...events, newEvent]);
    } catch (err) {
      console.error('Failed to create event:', err);
      setError('Failed to create event');
    }
  };
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };
  
  const hasEvent = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.some(event => {
      const eventDate = new Date(event.start_datetime);
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return eventDateStr === dateStr;
    });
  };
  
  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return eventDateStr === dateStr;
    });
  };
  
  const days = getDaysInMonth(currentDate);
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="mt-1 text-lg text-gray-600">
              Manage your schedule and events
            </p>
          </div>
          
          <Button
            icon={<PlusIcon className="w-5 h-5" />}
            className="bg-grape-600 hover:bg-grape-700"
            onClick={handleCreateEvent}
            disabled={loading}
          >
            Add Event
          </Button>
        </div>
        
        {/* Calendar Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                icon={<ChevronLeftIcon className="w-4 h-4" />}
              />
              <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                icon={<ChevronRightIcon className="w-4 h-4" />}
              />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            {(['month', 'week', 'day'] as const).map((viewOption) => (
              <Button
                key={viewOption}
                variant={view === viewOption ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setView(viewOption)}
              >
                {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Calendar Grid */}
        <Card>
          <CardContent padding="none">
            {view === 'month' && (
              <div className="grid grid-cols-7 gap-0">
                {/* Week day headers */}
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-4 text-center text-sm font-medium text-gray-500 border-b border-gray-200"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      'min-h-[120px] p-2 border-b border-r border-gray-200 relative',
                      day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                    )}
                  >
                    {day && (
                      <>
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full',
                            isToday(day)
                              ? 'bg-grape-600 text-white'
                              : 'text-gray-900'
                          )}
                        >
                          {day}
                        </span>
                        
                        {/* Events */}
                        <div className="mt-1 space-y-1">
                          {getEventsForDay(day).slice(0, 3).map((event) => {
                            const eventDate = new Date(event.start_datetime);
                            const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return (
                              <div
                                key={event.id}
                                className={cn(
                                  'text-xs px-2 py-1 rounded text-white truncate',
                                  event.color || 'bg-blue-500'
                                )}
                              >
                                {timeStr} {event.title}
                              </div>
                            );
                          })}
                          {getEventsForDay(day).length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{getEventsForDay(day).length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Events */}
        <Card>
          <CardHeader title="Upcoming Events" />
          <CardContent>
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming events</p>
                  <p className="text-sm text-gray-400">Create your first event to get started</p>
                </div>
              ) : (
                events.slice(0, 5).map((event) => {
                  const eventDate = new Date(event.start_datetime);
                  const dateStr = eventDate.toLocaleDateString();
                  const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endDate = new Date(event.end_datetime);
                  const duration = Math.round((endDate.getTime() - eventDate.getTime()) / (1000 * 60));
                  const durationStr = duration >= 60 ? `${Math.floor(duration / 60)}h` : `${duration}m`;
                  
                  return (
                    <div key={event.id} className="flex items-center space-x-4">
                      <div className={cn('w-3 h-3 rounded-full', event.color || 'bg-blue-500')} />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500">
                          {dateStr} at {timeStr} • {durationStr}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;