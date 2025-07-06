'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  CalendarIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);
  
  // Real search would happen here - for now showing empty state
  const searchResults: any[] = [];
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search</h1>
          <p className="mt-1 text-lg text-gray-600">
            Find anything across your boards, calendar, and journal
          </p>
        </div>
        
        {/* Search Input */}
        <Card>
          <CardContent padding="lg">
            <Input
              type="text"
              placeholder="Search everything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
              fullWidth
              autoFocus
            />
          </CardContent>
        </Card>
        
        {/* Search Results */}
        {query ? (
          <Card>
            <CardHeader title={`Results for "${query}"`} />
            <CardContent>
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-500">
                    Try different keywords or create some content first
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {result.type === 'board' && <RectangleStackIcon className="w-5 h-5 text-blue-500" />}
                          {result.type === 'event' && <CalendarIcon className="w-5 h-5 text-green-500" />}
                          {result.type === 'journal' && <BookOpenIcon className="w-5 h-5 text-purple-500" />}
                          {result.type === 'card' && <DocumentTextIcon className="w-5 h-5 text-orange-500" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{result.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                              {result.type}
                            </span>
                            <span className="text-xs text-gray-500">{result.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent padding="xl">
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
                <p className="text-gray-500">
                  Enter keywords to search across all your content
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchPage;