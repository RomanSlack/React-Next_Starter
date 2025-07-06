'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  FaceSmileIcon,
  FaceFrownIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/cn';

const JournalPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  // Mock entries
  const entries = [
    {
      id: '1',
      title: 'Productive Monday',
      content: 'Had a great start to the week. Completed the design mockups and got positive feedback from the team. Feeling motivated for the rest of the week.',
      date: '2024-01-15',
      mood: 'great',
      tags: ['work', 'productivity', 'design'],
      weather: 'sunny',
    },
    {
      id: '2',
      title: 'Learning New Technologies',
      content: 'Spent the day learning React 19 and Next.js 15. The new features are amazing, especially the server components. Can\'t wait to implement them in our projects.',
      date: '2024-01-14',
      mood: 'good',
      tags: ['learning', 'tech', 'react'],
      weather: 'cloudy',
    },
    {
      id: '3',
      title: 'Weekend Reflections',
      content: 'Spent quality time with family this weekend. Went hiking and had a great barbecue. These moments remind me what\'s truly important in life.',
      date: '2024-01-13',
      mood: 'great',
      tags: ['family', 'weekend', 'nature'],
      weather: 'sunny',
    },
    {
      id: '4',
      title: 'Challenging Day',
      content: 'Faced some difficult technical challenges today. The database migration didn\'t go as planned, but we managed to solve it by the end of the day.',
      date: '2024-01-12',
      mood: 'okay',
      tags: ['work', 'challenges', 'database'],
      weather: 'rainy',
    },
  ];
  
  const moods = [
    { value: 'great', label: 'Great', icon: '😄', color: 'bg-green-500' },
    { value: 'good', label: 'Good', icon: '😊', color: 'bg-blue-500' },
    { value: 'okay', label: 'Okay', icon: '😐', color: 'bg-yellow-500' },
    { value: 'bad', label: 'Bad', icon: '😟', color: 'bg-orange-500' },
    { value: 'terrible', label: 'Terrible', icon: '😢', color: 'bg-red-500' },
  ];
  
  const getMoodConfig = (mood: string) => {
    return moods.find(m => m.value === mood) || moods[2];
  };
  
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMood = !selectedMood || entry.mood === selectedMood;
    
    return matchesSearch && matchesMood;
  });
  
  const stats = {
    totalEntries: entries.length,
    streak: 7, // Days in a row
    averageMood: 4.2,
    thisWeek: 3,
  };
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
            <p className="mt-1 text-lg text-gray-600">
              Capture your thoughts and reflections
            </p>
          </div>
          
          <Button
            icon={<PlusIcon className="w-5 h-5" />}
            className="bg-grape-600 hover:bg-grape-700"
          >
            New Entry
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
                <p className="text-sm text-gray-600">Total Entries</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.streak}</p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.averageMood}</p>
                <p className="text-sm text-gray-600">Average Mood</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.thisWeek}</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Mood:</span>
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(selectedMood === mood.value ? null : mood.value)}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm transition-all',
                  mood.color,
                  selectedMood === mood.value
                    ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                    : 'hover:scale-105'
                )}
                title={mood.label}
              >
                {mood.icon}
              </button>
            ))}
            {selectedMood && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMood(null)}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Entries */}
        <div className="space-y-6">
          {filteredEntries.map((entry) => {
            const moodConfig = getMoodConfig(entry.mood);
            return (
              <Card key={entry.id} hover clickable>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {entry.title}
                        </h3>
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs',
                            moodConfig.color
                          )}
                          title={moodConfig.label}
                        >
                          {moodConfig.icon}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{entry.date}</span>
                        <span>•</span>
                        <span className="capitalize">{entry.weather}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {entry.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-grape-100 text-grape-700 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredEntries.length === 0 && (
            <Card>
              <CardContent padding="xl">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">No entries found</p>
                  <p>Try adjusting your search or mood filter</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default JournalPage;