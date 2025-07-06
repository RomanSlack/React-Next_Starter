'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/cn';

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  
  // Mock events
  const events = [
    {
      id: '1',
      title: 'Team Meeting',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: '1h',
      color: 'bg-blue-500',
    },
    {
      id: '2',
      title: 'Client Call',
      date: '2024-01-16',
      time: '2:00 PM',
      duration: '30m',
      color: 'bg-green-500',
    },
    {
      id: '3',
      title: 'Project Review',
      date: '2024-01-17',
      time: '3:30 PM',
      duration: '2h',
      color: 'bg-purple-500',
    },
    {
      id: '4',
      title: 'Design Workshop',
      date: '2024-01-18',
      time: '9:00 AM',
      duration: '3h',
      color: 'bg-orange-500',
    },
  ];
  
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
    const dateStr = `2024-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.some(event => event.date === dateStr);
  };
  
  const getEventsForDay = (day: number) => {
    const dateStr = `2024-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
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
                          {getEventsForDay(day).slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                'text-xs px-2 py-1 rounded text-white truncate',
                                event.color
                              )}
                            >
                              {event.time} {event.title}
                            </div>
                          ))}
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
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center space-x-4">
                  <div className={cn('w-3 h-3 rounded-full', event.color)} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {event.date} at {event.time} • {event.duration}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;