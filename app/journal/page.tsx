'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  EyeSlashIcon,
  EyeIcon,
  CalendarIcon,
  TagIcon,
  BookOpenIcon,
  DocumentArrowDownIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { journalAPI } from '@/app/lib/api/journal';
import { JournalEntry } from '@/types';

const JournalPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'mood'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [entryForm, setEntryForm] = useState({
    title: '',
    content: '',
    mood: 'good',
    tags: [] as string[],
    is_private: false,
    is_favorite: false
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [searchQuery, selectedMood]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await journalAPI.getEntries(
        1, 20, 
        undefined, 
        undefined, 
        selectedMood || undefined,
        undefined,
        undefined,
        searchQuery || undefined
      );
      setEntries(response.items || []);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
      setError('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await journalAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateEntry = async () => {
    if (!entryForm.title.trim() || !entryForm.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      const newEntry = await journalAPI.createEntry({
        title: entryForm.title,
        content: entryForm.content,
        mood: entryForm.mood,
        tags: entryForm.tags,
        is_private: entryForm.is_private,
        is_favorite: entryForm.is_favorite
      });
      
      setEntries([newEntry, ...entries]);
      setShowCreateForm(false);
      setEntryForm({
        title: '',
        content: '',
        mood: 'good',
        tags: [],
        is_private: false,
        is_favorite: false
      });
      setError(null);
    } catch (err) {
      console.error('Failed to create entry:', err);
      setError('Failed to create journal entry');
    }
  };

  const handleUpdateEntry = async (entryId: string) => {
    if (!entryForm.title.trim() || !entryForm.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      const updatedEntry = await journalAPI.updateEntry(entryId, {
        title: entryForm.title,
        content: entryForm.content,
        mood: entryForm.mood,
        tags: entryForm.tags,
        is_private: entryForm.is_private,
        is_favorite: entryForm.is_favorite
      });
      
      setEntries(entries.map(entry => entry.id === entryId ? updatedEntry : entry));
      setEditingEntry(null);
      setEntryForm({
        title: '',
        content: '',
        mood: 'good',
        tags: [],
        is_private: false,
        is_favorite: false
      });
      setError(null);
    } catch (err) {
      console.error('Failed to update entry:', err);
      setError('Failed to update journal entry');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    
    try {
      await journalAPI.deleteEntry(entryId);
      setEntries(entries.filter(entry => entry.id !== entryId));
      fetchStats(); // Refresh stats
    } catch (err) {
      console.error('Failed to delete entry:', err);
      setError('Failed to delete journal entry');
    }
  };

  const handleToggleFavorite = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    
    try {
      const updatedEntry = await journalAPI.updateEntry(entryId, {
        is_favorite: !entry.is_favorite
      });
      setEntries(entries.map(e => e.id === entryId ? updatedEntry : e));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      setError('Failed to update entry');
    }
  };

  const startEditEntry = (entry: JournalEntry) => {
    setEntryForm({
      title: entry.title || '',
      content: entry.content,
      mood: entry.mood || 'good',
      tags: entry.tags || [],
      is_private: entry.is_private,
      is_favorite: entry.is_favorite
    });
    setEditingEntry(entry.id);
  };

  const addTag = () => {
    if (newTag.trim() && !entryForm.tags.includes(newTag.trim())) {
      setEntryForm({
        ...entryForm,
        tags: [...entryForm.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEntryForm({
      ...entryForm,
      tags: entryForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const initializeNewEntry = () => {
    setEntryForm({
      title: '',
      content: '',
      mood: 'good',
      tags: [],
      is_private: false,
      is_favorite: false
    });
    setShowCreateForm(true);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `journal-entries-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToMarkdown = () => {
    const markdown = filteredEntries.map(entry => {
      const date = new Date(entry.entry_date || entry.created_at).toLocaleDateString();
      const moodEmoji = getMoodConfig(entry.mood || 'good').icon;
      
      return `# ${entry.title || 'Untitled Entry'}

**Date:** ${date}  
**Mood:** ${moodEmoji} ${entry.mood || 'N/A'}  
**Tags:** ${entry.tags.map(tag => `#${tag}`).join(' ')}

${entry.content}

---
`;
    }).join('\n');
    
    const dataStr = markdown;
    const dataUri = 'data:text/markdown;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `journal-entries-${new Date().toISOString().split('T')[0]}.md`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
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
  
  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = !searchQuery || 
        (entry.title && entry.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesMood = !selectedMood || entry.mood === selectedMood;
      const matchesFavorites = !showFavoritesOnly || entry.is_favorite;
      const matchesPrivate = !showPrivateOnly || entry.is_private;
      
      return matchesSearch && matchesMood && matchesFavorites && matchesPrivate;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.entry_date || a.created_at).getTime() - new Date(b.entry_date || b.created_at).getTime();
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'mood':
          const aIndex = moods.findIndex(m => m.value === a.mood);
          const bIndex = moods.findIndex(m => m.value === b.mood);
          comparison = aIndex - bIndex;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  
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
          
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <Button
                variant="ghost"
                icon={<DocumentArrowDownIcon className="w-5 h-5" />}
                disabled={loading || filteredEntries.length === 0}
                className="border border-gray-300"
              >
                Export
              </Button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    onClick={exportToJSON}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span>Export as JSON</span>
                  </button>
                  <button
                    onClick={exportToMarkdown}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span>Export as Markdown</span>
                  </button>
                </div>
              </div>
            </div>
            
            <Button
              icon={<PlusIcon className="w-5 h-5" />}
              className="bg-grape-600 hover:bg-grape-700"
              onClick={initializeNewEntry}
              disabled={loading}
            >
              New Entry
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total_entries || 0}</p>
                <p className="text-sm text-gray-600">Total Entries</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.streak_days || 0}</p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.average_words_per_entry || 0}</p>
                <p className="text-sm text-gray-600">Avg Words</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent padding="lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.entries_this_week || 0}</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent padding="lg">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search entries by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                />
              </div>
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Mood:</span>
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(selectedMood === mood.value ? null : mood.value)}
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm transition-all shadow-sm',
                        mood.color,
                        selectedMood === mood.value
                          ? 'ring-2 ring-offset-2 ring-gray-400 scale-110 shadow-lg'
                          : 'hover:scale-105 hover:shadow-md'
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
                      className="ml-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="favorites-only"
                      checked={showFavoritesOnly}
                      onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-grape-600 focus:ring-grape-500 focus:ring-2"
                    />
                    <label htmlFor="favorites-only" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                      <StarIcon className="w-4 h-4 mr-1" />
                      Favorites only
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private-only"
                      checked={showPrivateOnly}
                      onChange={(e) => setShowPrivateOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-grape-600 focus:ring-grape-500 focus:ring-2"
                    />
                    <label htmlFor="private-only" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                      <EyeSlashIcon className="w-4 h-4 mr-1" />
                      Private only
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'mood')}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-grape-500"
                  >
                    <option value="date">Date</option>
                    <option value="title">Title</option>
                    <option value="mood">Mood</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="text-sm px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </button>
                </div>
              </div>
            </div>
            
            {(searchQuery || selectedMood || showFavoritesOnly || showPrivateOnly) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {filteredEntries.length} result{filteredEntries.length !== 1 ? 's' : ''} found
                    {selectedMood && ` with ${moods.find(m => m.value === selectedMood)?.label.toLowerCase()} mood`}
                    {searchQuery && ` matching "${searchQuery}"`}
                    {showFavoritesOnly && ` (favorites only)`}
                    {showPrivateOnly && ` (private only)`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMood(null);
                      setShowFavoritesOnly(false);
                      setShowPrivateOnly(false);
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Entry Form */}
        {(showCreateForm || editingEntry) && (
          <Card className="border-grape-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingEntry ? 'Edit Entry' : 'Create New Entry'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<XMarkIcon className="w-4 h-4" />}
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingEntry(null);
                    setEntryForm({ title: '', content: '', mood: 'good', tags: [], is_private: false, is_favorite: false });
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={entryForm.title}
                    onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                    placeholder="Enter entry title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-grape-500 shadow-sm transition-all duration-200 hover:border-grape-400 focus:shadow-md"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={entryForm.content}
                    onChange={(e) => setEntryForm({ ...entryForm, content: e.target.value })}
                    placeholder="Share your thoughts, experiences, and reflections..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-grape-500 shadow-sm transition-all duration-200 hover:border-grape-400 focus:shadow-md resize-none"
                    rows={6}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mood
                    </label>
                    <div className="flex items-center space-x-2">
                      {moods.map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => setEntryForm({ ...entryForm, mood: mood.value })}
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm transition-all',
                            mood.color,
                            entryForm.mood === mood.value
                              ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                              : 'hover:scale-105'
                          )}
                          title={mood.label}
                        >
                          {mood.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-grape-500"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button
                        size="sm"
                        onClick={addTag}
                        disabled={!newTag.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entryForm.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-grape-100 text-grape-700 text-xs rounded-full"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-grape-500 hover:text-grape-700"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-private"
                      checked={entryForm.is_private}
                      onChange={(e) => setEntryForm({ ...entryForm, is_private: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-grape-600 focus:ring-grape-500 focus:ring-2"
                    />
                    <label htmlFor="is-private" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                      <EyeSlashIcon className="w-4 h-4 mr-1" />
                      Private entry
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-favorite"
                      checked={entryForm.is_favorite}
                      onChange={(e) => setEntryForm({ ...entryForm, is_favorite: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-grape-600 focus:ring-grape-500 focus:ring-2"
                    />
                    <label htmlFor="is-favorite" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                      <StarIcon className="w-4 h-4 mr-1" />
                      Mark as favorite
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-4 mt-4 border-t">
                <Button
                  onClick={() => editingEntry ? handleUpdateEntry(editingEntry) : handleCreateEntry()}
                  disabled={!entryForm.title.trim() || !entryForm.content.trim() || loading}
                  className="bg-grape-600 hover:bg-grape-700"
                >
                  {editingEntry ? 'Update Entry' : 'Create Entry'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingEntry(null);
                    setEntryForm({ title: '', content: '', mood: 'good', tags: [], is_private: false, is_favorite: false });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent padding="sm">
              <div className="flex items-center justify-between">
                <p className="text-red-600 text-sm">{error}</p>
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
        
        {/* Entries */}
        <div className="space-y-6">
          {filteredEntries.map((entry) => {
            const moodConfig = getMoodConfig(entry.mood || 'good');
            const entryDate = new Date(entry.entry_date || entry.created_at);
            const dateStr = entryDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const timeStr = new Date(entry.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            
            return (
              <Card key={entry.id} hover>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {entry.title || 'Untitled Entry'}
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
                        {entry.is_favorite && (
                          <StarIconSolid className="w-5 h-5 text-yellow-500" title="Favorite" />
                        )}
                        {entry.is_private && (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400" title="Private" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{dateStr}</span>
                        </div>
                        <span>•</span>
                        <span>{timeStr}</span>
                        {entry.tags && entry.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <TagIcon className="w-4 h-4" />
                              <span>{entry.tags.length} tag{entry.tags.length !== 1 ? 's' : ''}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={entry.is_favorite ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                        onClick={() => handleToggleFavorite(entry.id)}
                        className={entry.is_favorite ? 'text-red-500 hover:text-red-600' : ''}
                        title={entry.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<PencilIcon className="w-4 h-4" />}
                        onClick={() => startEditEntry(entry)}
                        title="Edit entry"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<TrashIcon className="w-4 h-4" />}
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete entry"
                      />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="prose prose-sm max-w-none mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap line-clamp-4">
                      {entry.content}
                    </p>
                  </div>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-grape-100 text-grape-700 text-xs rounded-full cursor-pointer hover:bg-grape-200 transition-colors"
                          onClick={() => setSearchQuery(tag)}
                          title={`Search for "${tag}"`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Word count */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      {entry.content.split(' ').length} word{entry.content.split(' ').length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created: {new Date(entry.created_at).toLocaleDateString()}</span>
                      {entry.updated_at !== entry.created_at && (
                        <span>Updated: {new Date(entry.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {entries.length === 0 ? (
            <Card>
              <CardContent padding="xl">
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📖</span>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Start your journaling journey</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Capture your thoughts, track your mood, and reflect on your experiences. Your first entry is just a click away.
                  </p>
                  <Button
                    icon={<PlusIcon className="w-5 h-5" />}
                    className="bg-grape-600 hover:bg-grape-700"
                    onClick={initializeNewEntry}
                    disabled={loading}
                  >
                    Write Your First Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredEntries.length === 0 ? (
            <Card>
              <CardContent padding="xl">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">No entries found</p>
                  <p>Try adjusting your search or mood filter</p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
};

export default JournalPage;