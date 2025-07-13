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
  XMarkIcon,
  TrashIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { boardsAPI } from '@/app/lib/api/boards';
import { Board } from '@/types';

const BoardsPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    color: '#3b82f6'
  });
  
  const starredBoards = boards.filter(board => board.is_starred);
  const recentBoards = boards.filter(board => !board.is_starred && !board.is_archived);

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
    if (!createForm.title.trim()) {
      setError('Board title is required');
      return;
    }
    
    try {
      const newBoard = await boardsAPI.createBoard({
        title: createForm.title,
        description: createForm.description,
        color: createForm.color
      });
      setBoards([...boards, newBoard]);
      setShowCreateForm(false);
      setCreateForm({ title: '', description: '', color: '#3b82f6' });
      setError(null);
    } catch (err) {
      console.error('Failed to create board:', err);
      setError('Failed to create board');
    }
  };

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this board?')) return;
    
    try {
      await boardsAPI.deleteBoard(boardId);
      setBoards(boards.filter(board => board.id !== boardId));
    } catch (err) {
      console.error('Failed to delete board:', err);
      setError('Failed to delete board');
    }
  };

  const handleToggleStar = async (boardId: string, isStarred: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const updatedBoard = await boardsAPI.updateBoard(boardId, { is_starred: !isStarred });
      setBoards(boards.map(board => board.id === boardId ? updatedBoard : board));
    } catch (err) {
      console.error('Failed to update board:', err);
      setError('Failed to update board');
    }
  };

  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
  ];
  
  const getCompletionPercentage = (completed: number = 0, total: number = 0) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Boards</h1>
            <p className="mt-1 text-lg text-gray-600">
              Organize your projects with Kanban boards
            </p>
          </div>
          
          <Button
            icon={<PlusIcon className="w-5 h-5" />}
            className="bg-grape-600 hover:bg-grape-700"
            onClick={() => setShowCreateForm(true)}
            disabled={loading}
          >
            Create Board
          </Button>
        </div>

        {/* Create Board Form */}
        {showCreateForm && (
          <Card className="mb-6 border-grape-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Create New Board</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<XMarkIcon className="w-4 h-4" />}
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateForm({ title: '', description: '', color: '#3b82f6' });
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Board Title *
                  </label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Enter board title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-grape-500"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Enter board description"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-grape-500"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Board Color
                  </label>
                  <div className="flex items-center space-x-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCreateForm({ ...createForm, color })}
                        className={cn(
                          "w-8 h-8 rounded-lg border-2 transition-all",
                          createForm.color === color ? "border-gray-900 scale-110" : "border-gray-200"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 pt-2">
                  <Button
                    onClick={handleCreateBoard}
                    disabled={!createForm.title.trim() || loading}
                    className="bg-grape-600 hover:bg-grape-700"
                  >
                    Create Board
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowCreateForm(false);
                      setCreateForm({ title: '', description: '', color: '#3b82f6' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Starred Boards */}
        {starredBoards.length > 0 && (
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <StarIconSolid className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-foreground">Starred Boards</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {starredBoards.map((board) => (
                <Link key={board.id} href={`/boards/${board.id}`}>
                  <Card clickable hover className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: board.color }}
                        >
                          <RectangleStackIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={(e) => handleToggleStar(board.id, board.is_starred || false, e)}
                            className="text-gray-400 hover:text-yellow-500"
                          >
                            {board.is_starred ? (
                              <StarIconSolid className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <StarIcon className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            onClick={(e) => handleDeleteBoard(board.id, e)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mt-3">
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
                              {getCompletionPercentage(board.completedCards || 0, board.totalCards || 0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-grape-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${getCompletionPercentage(board.completedCards || 0, board.totalCards || 0)}%`
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {board.completedCards || 0} of {board.totalCards || 0} cards completed
                          </p>
                        </div>
                        
                        {/* Members and Activity */}
                        <div className="flex items-center justify-between">
                          <AvatarGroup
                            avatars={board.members || []}
                            max={3}
                            size="sm"
                          />
                          <span className="text-xs text-gray-500">
                            {board.lastActivity || 'No activity yet'}
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
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Boards</h2>
          
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
                  <h3 className="text-xl font-medium text-foreground mb-2">No boards yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Get organized by creating your first Kanban board. Track tasks, manage projects, and collaborate with your team.
                  </p>
                  <Button
                    icon={<PlusIcon className="w-5 h-5" />}
                    className="bg-grape-600 hover:bg-grape-700"
                    onClick={() => setShowCreateForm(true)}
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
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: board.color }}
                        >
                          <RectangleStackIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={(e) => handleToggleStar(board.id, board.is_starred || false, e)}
                            className="text-gray-400 hover:text-yellow-500"
                          >
                            {board.is_starred ? (
                              <StarIconSolid className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <StarIcon className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            onClick={(e) => handleDeleteBoard(board.id, e)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mt-3">
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
                              {getCompletionPercentage(board.completedCards || 0, board.totalCards || 0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-grape-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${getCompletionPercentage(board.completedCards || 0, board.totalCards || 0)}%`
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {board.completedCards || 0} of {board.totalCards || 0} cards completed
                          </p>
                        </div>
                        
                        {/* Members and Activity */}
                        <div className="flex items-center justify-between">
                          <AvatarGroup
                            avatars={board.members || []}
                            max={3}
                            size="sm"
                          />
                          <span className="text-xs text-gray-500">
                            {board.lastActivity || 'No activity yet'}
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