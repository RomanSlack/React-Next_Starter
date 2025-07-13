'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Loading } from '@/app/components/ui/Loading';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { questAPI, QuestArchive } from '@/app/lib/api/quest';

interface QuestArchiveProps {
  onClose: () => void;
  onSelectDate: (date: string) => void;
}

const QuestArchiveComponent: React.FC<QuestArchiveProps> = ({
  onClose,
  onSelectDate
}) => {
  const [archive, setArchive] = useState<QuestArchive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  const loadArchive = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await questAPI.getQuestArchive({ limit: 90 }); // Last 90 days
      setArchive(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load archive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchive();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getCompletionColor = (completed: number, total: number) => {
    if (total === 0) return 'bg-gray-100';
    const percentage = completed / total;
    if (percentage === 1) return 'bg-green-500';
    if (percentage >= 0.7) return 'bg-blue-500';
    if (percentage >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader
          title="Quest Archive"
          action={
            <Button variant="ghost" onClick={onClose} icon={<XMarkIcon className="w-4 h-4" />} />
          }
        />
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <Loading size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !archive) {
    return (
      <Card>
        <CardHeader
          title="Quest Archive"
          action={
            <Button variant="ghost" onClick={onClose} icon={<XMarkIcon className="w-4 h-4" />} />
          }
        />
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Failed to load archive'}</p>
            <Button onClick={loadArchive}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(archive.days.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDays = archive.days.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader
        title="Quest Archive"
        subtitle={`${archive.days.length} days with quests`}
        action={
          <Button variant="ghost" onClick={onClose} icon={<XMarkIcon className="w-4 h-4" />} />
        }
      />
      <CardContent>
        {archive.days.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quest history yet</h3>
            <p className="text-muted-foreground">Start creating quests to build your history.</p>
          </div>
        ) : (
          <>
            {/* Archive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {currentDays.map((day) => (
                <button
                  key={day.date}
                  onClick={() => onSelectDate(day.date)}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(day.date)}
                    </span>
                    <div
                      className={`w-3 h-3 rounded-full ${getCompletionColor(
                        day.completed_count,
                        day.total_count
                      )}`}
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Tasks:</span>
                      <span>{day.total_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Done:</span>
                      <span className="text-green-600">{day.completed_count}</span>
                    </div>
                    {day.pending_count > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Pending:</span>
                        <span className="text-orange-600">{day.pending_count}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getCompletionColor(
                        day.completed_count,
                        day.total_count
                      )}`}
                      style={{
                        width: `${day.total_count > 0 ? (day.completed_count / day.total_count) * 100 : 0}%`
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  icon={<ChevronLeftIcon className="w-4 h-4" />}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  icon={<ChevronRightIcon className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-muted-foreground mb-2">Completion Status:</p>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>100%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>70%+</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>40%+</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>&lt;40%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-gray-100"></div>
                  <span>No tasks</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestArchiveComponent;