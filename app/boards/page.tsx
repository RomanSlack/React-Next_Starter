'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Avatar, AvatarGroup } from '@/app/components/ui/Avatar';
import {
  PlusIcon,
  RectangleStackIcon,
  StarIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { boardsAPI } from '@/app/lib/api/boards';
import { Board } from '@/types';

const BoardsPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const starredBoards = boards.filter(board => board.is_starred);
  const recentBoards = boards.filter(board => !board.is_starred);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await boardsAPI.getBoards();
      setBoards(response.items || []);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      setError('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    try {
      const newBoard = await boardsAPI.createBoard({
        title: 'New Board',
        description: 'Add a description for your board',
        color: 'bg-blue-500'
      });
      setBoards([...boards, newBoard]);
    } catch (err) {
      console.error('Failed to create board:', err);
      setError('Failed to create board');
    }
  };
  
  const getCompletionPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Boards</h1>
            <p className="mt-1 text-lg text-gray-600">
              Organize your projects with Kanban boards
            </p>
          </div>
          
          <Button
            icon={<PlusIcon className="w-5 h-5" />}
            className="bg-grape-600 hover:bg-grape-700"
            onClick={handleCreateBoard}
            disabled={loading}
          >
            Create Board
          </Button>
        </div>
        
        {/* Starred Boards */}
        {starredBoards.length > 0 && (
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <StarIconSolid className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Starred Boards</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {starredBoards.map((board) => (
                <Link key={board.id} href={`/boards/${board.id}`}>
                  <Card clickable hover className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', board.color)}>
                          <RectangleStackIcon className="w-5 h-5 text-white" />
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mt-3">
                        {board.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {board.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">
                              {getCompletionPercentage(board.completedCards, board.totalCards)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-grape-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${getCompletionPercentage(board.completedCards, board.totalCards)}%`
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {board.completedCards} of {board.totalCards} cards completed
                          </p>
                        </div>
                        
                        {/* Members and Activity */}
                        <div className="flex items-center justify-between">
                          <AvatarGroup
                            avatars={board.members}
                            max={3}
                            size="sm"
                          />
                          <span className="text-xs text-gray-500">
                            {board.lastActivity}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent padding="lg">
              <div className="text-center text-red-600">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2"
                  onClick={fetchBoards}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Boards */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Boards</h2>
          
          {loading ? (
            <Card>
              <CardContent padding="xl">
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-grape-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading boards...</p>
                </div>
              </CardContent>
            </Card>
          ) : boards.length === 0 ? (
            <Card>
              <CardContent padding="xl">
                <div className="text-center py-12">
                  <RectangleStackIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No boards yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Get organized by creating your first Kanban board. Track tasks, manage projects, and collaborate with your team.
                  </p>
                  <Button
                    icon={<PlusIcon className="w-5 h-5" />}
                    className="bg-grape-600 hover:bg-grape-700"
                    onClick={handleCreateBoard}
                    disabled={loading}
                  >
                    Create Your First Board
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentBoards.map((board) => (
                <Link key={board.id} href={`/boards/${board.id}`}>
                  <Card clickable hover className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', board.color)}>
                          <RectangleStackIcon className="w-5 h-5 text-white" />
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mt-3">
                        {board.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {board.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">
                              {getCompletionPercentage(board.completedCards, board.totalCards)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-grape-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${getCompletionPercentage(board.completedCards, board.totalCards)}%`
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {board.completedCards} of {board.totalCards} cards completed
                          </p>
                        </div>
                        
                        {/* Members and Activity */}
                        <div className="flex items-center justify-between">
                          <AvatarGroup
                            avatars={board.members}
                            max={3}
                            size="sm"
                          />
                          <span className="text-xs text-gray-500">
                            {board.lastActivity}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default BoardsPage;