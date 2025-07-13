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
  XMarkIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    color: '#3b82f6',
    is_all_day: false
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let startDate, endDate;
      
      if (view === 'month') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else if (view === 'week') {
        const dayOfWeek = currentDate.getDay();
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - dayOfWeek);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
      } else { // day
        startDate = new Date(currentDate);
        endDate = new Date(currentDate);
      }
      
      const response = await calendarAPI.getEvents(
        1, 100, 
        startDate.toISOString(), 
        endDate.toISOString()
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
    if (!eventForm.title.trim()) {
      setError('Event title is required');
      return;
    }
    
    try {
      const newEvent = await calendarAPI.createEvent({
        title: eventForm.title,
        description: eventForm.description,
        start_datetime: eventForm.start_datetime,
        end_datetime: eventForm.end_datetime,
        event_type: 'personal',
        color: eventForm.color,
        is_all_day: eventForm.is_all_day,
        is_recurring: false
      });
      
      setEvents([...events, newEvent]);
      setShowCreateForm(false);
      setEventForm({
        title: '',
        description: '',
        start_datetime: '',
        end_datetime: '',
        color: '#3b82f6',
        is_all_day: false
      });
      setError(null);
    } catch (err) {
      console.error('Failed to create event:', err);
      setError('Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await calendarAPI.deleteEvent(eventId);
      setEvents(events.filter(event => event.id !== eventId));
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError('Failed to delete event');
    }
  };
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const time12 = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
    return { hour, time12, time24: `${hour.toString().padStart(2, '0')}:00` };
  });

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

  const getWeekDays = (date: Date) => {
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };
  
  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'month') {
        newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      } else if (view === 'week') {
        newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      } else { // day
        newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
      }
      return newDate;
    });
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const getEventsForTimeSlot = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_datetime);
      const eventDate = eventStart.toISOString().split('T')[0];
      const currentDate = date.toISOString().split('T')[0];
      const eventHour = eventStart.getHours();
      
      return eventDate === currentDate && eventHour === hour;
    });
  };

  const formatViewTitle = () => {
    if (view === 'month') {
      return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${months[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
      } else {
        return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
      }
    } else {
      return `${months[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    }
  };

  const initializeEventForm = () => {
    const now = new Date();
    const start = new Date(now);
    start.setMinutes(0, 0, 0); // Round to hour
    const end = new Date(start);
    end.setHours(start.getHours() + 1); // 1 hour duration
    
    setEventForm({
      title: '',
      description: '',
      start_datetime: start.toISOString().slice(0, 16),
      end_datetime: end.toISOString().slice(0, 16),
      color: '#3b82f6',
      is_all_day: false
    });
  };

  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
  ];
  
  const days = getDaysInMonth(currentDate);
  const weekDaysForView = getWeekDays(currentDate);
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Manage your schedule and events
            </p>
          </div>
          
          <Button
            icon={<PlusIcon className="w-5 h-5" />}
            className="bg-accent hover:bg-accent/90"
            onClick={() => {
              initializeEventForm();
              setShowCreateForm(true);
            }}
            disabled={loading}
          >
            Add Event
          </Button>
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Create New Event</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<XMarkIcon className="w-4 h-4" />}
                  onClick={() => setShowCreateForm(false)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Enter event title"
                      className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-accent shadow-sm transition-all duration-200 hover:border-accent/80 focus:shadow-md"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Enter event description"
                      className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-accent shadow-sm transition-all duration-200 hover:border-accent/80 focus:shadow-md resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={eventForm.start_datetime}
                        onChange={(e) => {
                          const startTime = e.target.value;
                          // Auto-update end time to 1 hour later
                          if (startTime) {
                            const startDate = new Date(startTime);
                            const endDate = new Date(startDate);
                            endDate.setHours(startDate.getHours() + 1);
                            
                            setEventForm({ 
                              ...eventForm, 
                              start_datetime: startTime,
                              end_datetime: endDate.toISOString().slice(0, 16)
                            });
                          } else {
                            setEventForm({ ...eventForm, start_datetime: startTime });
                          }
                        }}
                        className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-accent shadow-sm transition-all duration-200 hover:border-accent/80"
                        step="900" // 15-minute increments
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        value={eventForm.end_datetime}
                        onChange={(e) => setEventForm({ ...eventForm, end_datetime: e.target.value })}
                        className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-accent shadow-sm transition-all duration-200 hover:border-accent/80"
                        step="900" // 15-minute increments
                      />
                    </div>
                  </div>
                  
                  {/* Duration Indicator */}
                  {eventForm.start_datetime && eventForm.end_datetime && (
                    <div className="text-center">
                      <div className="inline-flex items-center px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full border border-accent/20"
                        <span>Duration: {(() => {
                          const start = new Date(eventForm.start_datetime);
                          const end = new Date(eventForm.end_datetime);
                          const diffMs = end.getTime() - start.getTime();
                          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                          
                          if (diffHours > 0) {
                            return diffMinutes > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffHours}h`;
                          } else {
                            return `${diffMinutes}m`;
                          }
                        })()}</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Event Color
                    </label>
                    <div className="flex items-center space-x-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEventForm({ ...eventForm, color })}
                          className={cn(
                            "w-10 h-10 rounded-xl border-3 transition-all duration-200 hover:scale-105 shadow-sm",
                            eventForm.color === color 
                              ? "border-accent scale-110 shadow-lg" 
                              : "border-border hover:border-border"
                          )}
                          style={{ backgroundColor: color }}
                          title={`Select ${color}`}
                        >
                          {eventForm.color === color && (
                            <div className="w-full h-full rounded-lg flex items-center justify-center">
                              <CheckIcon className="w-5 h-5 text-white drop-shadow-sm" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border"
                    <input
                      type="checkbox"
                      id="all-day"
                      checked={eventForm.is_all_day}
                      onChange={(e) => setEventForm({ ...eventForm, is_all_day: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-accent focus:ring-accent focus:ring-2"
                    />
                    <label htmlFor="all-day" className="text-sm font-medium text-foreground cursor-pointer">
                      All day event
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-4 mt-4 border-t">
                <Button
                  onClick={handleCreateEvent}
                  disabled={!eventForm.title.trim() || loading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Create Event
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent padding="sm">
              <div className="flex items-center justify-between">
                <p className="text-destructive text-sm">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  icon={<XMarkIcon className="w-4 h-4" />}
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Calendar Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('prev')}
                icon={<ChevronLeftIcon className="w-4 h-4" />}
              />
              <h2 className="text-xl font-semibold text-foreground min-w-[250px] text-center">
                {formatViewTitle()}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('next')}
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
                {weekDaysShort.map((day) => (
                  <div
                    key={day}
                    className="p-4 text-center text-sm font-medium text-foreground border-b border-border"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      'min-h-[120px] p-2 border-b border-r border-border relative',
                      day ? 'hover:bg-muted cursor-pointer' : 'bg-muted/50'
                    )}
                  >
                    {day && (
                      <>
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full',
                            isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                              ? 'bg-accent text-accent-foreground'
                              : 'text-foreground'
                          )}
                        >
                          {day}
                        </span>
                        
                        {/* Events */}
                        <div className="mt-1 space-y-1">
                          {getEventsForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)).slice(0, 3).map((event) => {
                            const eventDate = new Date(event.start_datetime);
                            const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return (
                              <div
                                key={event.id}
                                className="text-xs px-2 py-1 rounded text-white truncate"
                                style={{ backgroundColor: event.color }}
                              >
                                {timeStr} {event.title}
                              </div>
                            );
                          })}
                          {getEventsForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)).length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{getEventsForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)).length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {view === 'week' && (
              <div className="grid grid-cols-8 gap-0">
                {/* Time column header */}
                <div className="p-4 text-center text-sm font-medium text-muted-foreground border-b border-r border-border">
                  Time
                </div>
                
                {/* Day headers */}
                {weekDaysForView.map((date, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-4 text-center border-b border-r border-border',
                      isToday(date) ? 'bg-accent/10' : ''
                    )}
                  >
                    <div className="text-sm font-medium text-muted-foreground">
                      {weekDaysShort[date.getDay()]}
                    </div>
                    <div className={cn(
                      'text-lg font-medium mt-1',
                      isToday(date) ? 'text-accent' : 'text-foreground'
                    )}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}
                
                {/* Time slots */}
                {timeSlots.map((slot) => (
                  <React.Fragment key={slot.hour}>
                    {/* Time label */}
                    <div className="p-2 text-xs text-muted-foreground border-b border-r border-border text-right">
                      {slot.time12}
                    </div>
                    
                    {/* Day columns */}
                    {weekDaysForView.map((date, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={cn(
                          'min-h-[60px] p-1 border-b border-r border-border relative',
                          isToday(date) ? 'bg-accent/10' : 'hover:bg-muted/50'
                        )}
                      >
                        {getEventsForTimeSlot(date, slot.hour).map((event) => (
                          <div
                            key={event.id}
                            className="text-xs px-2 py-1 rounded text-white truncate mb-1"
                            style={{ backgroundColor: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            )}

            {view === 'day' && (
              <div className="grid grid-cols-2 gap-0">
                {/* Time column */}
                <div>
                  <div className="p-4 text-center text-sm font-medium text-muted-foreground border-b border-r border-border">
                    Time
                  </div>
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.hour}
                      className="p-3 text-sm text-muted-foreground border-b border-r border-border text-right min-h-[60px]"
                    >
                      {slot.time12}
                    </div>
                  ))}
                </div>
                
                {/* Day column */}
                <div>
                  <div className={cn(
                    'p-4 text-center border-b border-border',
                    isToday(currentDate) ? 'bg-accent/10' : ''
                  )}>
                    <div className="text-sm font-medium text-muted-foreground">
                      {weekDays[currentDate.getDay()]}
                    </div>
                    <div className={cn(
                      'text-lg font-medium mt-1',
                      isToday(currentDate) ? 'text-accent' : 'text-foreground'
                    )}>
                      {currentDate.getDate()}
                    </div>
                  </div>
                  
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.hour}
                      className={cn(
                        'min-h-[60px] p-2 border-b border-border relative',
                        isToday(currentDate) ? 'bg-accent/10' : 'hover:bg-muted/50'
                      )}
                    >
                      {getEventsForTimeSlot(currentDate, slot.hour).map((event) => (
                        <div
                          key={event.id}
                          className="text-sm px-3 py-2 rounded text-white truncate mb-1 flex items-center justify-between"
                          style={{ backgroundColor: event.color }}
                        >
                          <span>{event.title}</span>
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() => setEditingEvent(event.id)}
                              className="text-white/80 hover:text-white"
                            >
                              <PencilIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-white/80 hover:text-white"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {getEventsForTimeSlot(currentDate, slot.hour).length === 0 && (
                        <div className="text-center text-muted-foreground text-xs py-4">
                          {/* Empty time slot */}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming events</p>
                  <p className="text-sm text-muted-foreground">Create your first event to get started</p>
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
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {dateStr} at {timeStr} • {durationStr}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          icon={<PencilIcon className="w-4 h-4" />}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          icon={<TrashIcon className="w-4 h-4" />}
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </Button>
                      </div>
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