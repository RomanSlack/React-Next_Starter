'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  RectangleStackIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ClockIcon,
  TagIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { searchAPI, SearchResult, SearchResponse } from '@/app/lib/api/search';
import { useAppStore } from '@/lib/stores/app';

const SearchPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useAppStore();
  
  const [currentQuery, setCurrentQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'boards' | 'cards' | 'calendar' | 'journal' | 'quests'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize search from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    const type = searchParams.get('type') as any;
    
    if (query) {
      setCurrentQuery(query);
      setSearchQuery(query);
      if (type && ['all', 'boards', 'cards', 'calendar', 'journal', 'quests'].includes(type)) {
        setSearchType(type);
      }
      performSearch(query, type || 'all');
    }
  }, [searchParams, setSearchQuery]);

  const performSearch = useCallback(async (query: string, type: string = 'all') => {
    if (!query.trim()) {
      setResults([]);
      setSearchResponse(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await searchAPI.search(
        query.trim(),
        type as any,
        50,
        0
      );
      
      setResults(response.results);
      setSearchResponse(response);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
      setResults([]);
      setSearchResponse(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', currentQuery.trim());
      if (searchType !== 'all') {
        params.set('type', searchType);
      }
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleTypeFilter = (type: typeof searchType) => {
    setSearchType(type);
    if (currentQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', currentQuery.trim());
      if (type !== 'all') {
        params.set('type', type);
      }
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'board':
        return <RectangleStackIcon className="w-5 h-5 text-blue-600" />;
      case 'card':
        return <DocumentTextIcon className="w-5 h-5 text-green-600" />;
      case 'calendar_event':
        return <CalendarIcon className="w-5 h-5 text-purple-600" />;
      case 'journal_entry':
        return <BookOpenIcon className="w-5 h-5 text-orange-600" />;
      case 'quest':
        return <TrophyIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getResultTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'board':
        return 'Board';
      case 'card':
        return 'Card';
      case 'calendar_event':
        return 'Event';
      case 'journal_entry':
        return 'Journal';
      case 'quest':
        return 'Quest';
      default:
        return 'Item';
    }
  };

  const getResultMetadataDisplay = (result: SearchResult) => {
    switch (result.type) {
      case 'card':
        return (
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Board: {result.metadata.board_title}</span>
            <span>Status: {result.metadata.status}</span>
            <span>Priority: {result.metadata.priority}</span>
          </div>
        );
      case 'calendar_event':
        const startDate = new Date(result.metadata.start_datetime);
        return (
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{startDate.toLocaleDateString()}</span>
            <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {result.metadata.location && <span>📍 {result.metadata.location}</span>}
          </div>
        );
      case 'journal_entry':
        return (
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{new Date(result.metadata.entry_date).toLocaleDateString()}</span>
            {result.metadata.mood && <span>Mood: {result.metadata.mood}</span>}
            {result.metadata.tags?.length > 0 && (
              <span>Tags: {result.metadata.tags.slice(0, 3).map((tag: string) => `#${tag}`).join(' ')}</span>
            )}
          </div>
        );
      case 'quest':
        return (
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{result.metadata.is_complete ? '✅ Completed' : '⏳ Pending'}</span>
            {result.metadata.date_created && (
              <span>Created: {new Date(result.metadata.date_created).toLocaleDateString()}</span>
            )}
            {result.metadata.date_due && (
              <span>Due: {new Date(result.metadata.date_due).toLocaleDateString()}</span>
            )}
            {result.metadata.time_due && (
              <span>at {result.metadata.time_due}</span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const typeFilters = [
    { value: 'all', label: 'All', icon: <MagnifyingGlassIcon className="w-4 h-4" /> },
    { value: 'boards', label: 'Boards', icon: <RectangleStackIcon className="w-4 h-4" /> },
    { value: 'cards', label: 'Cards', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { value: 'calendar', label: 'Events', icon: <CalendarIcon className="w-4 h-4" /> },
    { value: 'journal', label: 'Journal', icon: <BookOpenIcon className="w-4 h-4" /> },
    { value: 'quests', label: 'Quests', icon: <TrophyIcon className="w-4 h-4" /> },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-300">Search</h1>
            <p className="mt-1 text-lg text-gray-600">
              Find your content across boards, calendar, journal, and quests
            </p>
          </div>
          
          <Button
            variant="ghost"
            icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />}
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-neutral-600' : ''}
          >
            Filters
          </Button>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent padding="lg">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search boards, cards, events, journal entries, quests..."
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value)}
                    icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                    className="text-lg"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !currentQuery.trim()}
                  className="bg-neutral-300 hover:bg-neutral-400"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
              
              {/* Type Filters */}
              {showFilters && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Content type:</span>
                    {typeFilters.map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => handleTypeFilter(filter.value as any)}
                        className={cn(
                          'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          searchType === filter.value
                            ? 'bg-neutral-100 text-neutral-700 border border-neutral-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {filter.icon}
                        <span>{filter.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResponse && (
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Found {searchResponse.total} result{searchResponse.total !== 1 ? 's' : ''} for "{searchResponse.query}"
                {searchResponse.took_ms && ` in ${searchResponse.took_ms}ms`}
              </div>
              {searchResponse.total > 0 && (
                <div className="text-sm text-gray-500">
                  Showing {results.length} of {searchResponse.total}
                </div>
              )}
            </div>

            {/* Results List */}
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <Card
                    key={result.id}
                    hover
                    clickable
                    onClick={() => handleResultClick(result)}
                    className="transition-all duration-200 hover:shadow-md"
                  >
                    <CardContent padding="lg">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getResultIcon(result.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-200 truncate">
                              {result.title}
                            </h3>
                            <span className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              result.type === 'board' && 'bg-blue-100 text-blue-700',
                              result.type === 'card' && 'bg-green-100 text-green-700',
                              result.type === 'calendar_event' && 'bg-purple-100 text-purple-600',
                              result.type === 'journal_entry' && 'bg-orange-100 text-orange-700',
                              result.type === 'quest' && 'bg-yellow-100 text-yellow-700'
                            )}>
                              {getResultTypeLabel(result.type)}
                            </span>
                          </div>
                          
                          {result.description && (
                            <p className="text-neutral-300 mb-3 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          
                          {getResultMetadataDisplay(result)}
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Updated: {new Date(result.updated_at).toLocaleDateString()}</span>
                              <span>Score: {result.relevance_score.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !loading && searchResponse.query && (
              <Card>
                <CardContent padding="xl">
                  <div className="text-center py-8">
                    <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-300 mb-2">No results found</h3>
                    <p className="text-gray-500 mb-4">
                      We couldn't find anything matching "{searchResponse.query}"
                    </p>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Try:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Using different keywords</li>
                        <li>Checking your spelling</li>
                        <li>Using more general terms</li>
                        <li>Searching in a different content type</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent padding="lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XMarkIcon className="w-5 h-5 text-red-600" />
                  <p className="text-red-600">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!searchResponse && !loading && !error && (
          <Card>
            <CardContent padding="xl">
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Search your content</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Enter a search query above to find boards, cards, calendar events, journal entries, and quests.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
                  {typeFilters.slice(1).map((filter) => (
                    <div
                      key={filter.value}
                      className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="text-gray-200 mb-2">
                        {filter.icon}
                      </div>
                      <span className="text-sm text-gray-600">{filter.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchPage;