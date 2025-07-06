'use client';

import React from 'react';
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

const BoardsPage: React.FC = () => {
  // Mock data
  const boards = [
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      color: 'bg-blue-500',
      starred: true,
      members: [
        { name: 'John Doe' },
        { name: 'Jane Smith' },
        { name: 'Bob Johnson' },
      ],
      lastActivity: '2 hours ago',
      totalCards: 24,
      completedCards: 18,
    },
    {
      id: '2',
      title: 'Marketing Campaign Q1',
      description: 'Launch new marketing campaign for Q1 2024',
      color: 'bg-green-500',
      starred: false,
      members: [
        { name: 'Alice Wilson' },
        { name: 'Charlie Brown' },
      ],
      lastActivity: '1 day ago',
      totalCards: 16,
      completedCards: 8,
    },
    {
      id: '3',
      title: 'Product Launch',
      description: 'Coordinate the launch of our new product line',
      color: 'bg-purple-500',
      starred: true,
      members: [
        { name: 'David Lee' },
        { name: 'Emma Davis' },
        { name: 'Frank Miller' },
        { name: 'Grace Taylor' },
      ],
      lastActivity: '3 days ago',
      totalCards: 32,
      completedCards: 12,
    },
    {
      id: '4',
      title: 'Team Building',
      description: 'Plan team building activities and events',
      color: 'bg-orange-500',
      starred: false,
      members: [
        { name: 'Henry Adams' },
        { name: 'Ivy Chen' },
      ],
      lastActivity: '1 week ago',
      totalCards: 8,
      completedCards: 6,
    },
  ];
  
  const starredBoards = boards.filter(board => board.starred);
  const recentBoards = boards.filter(board => !board.starred);
  
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
        
        {/* Recent Boards */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Boards</h2>
          
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
        </section>
      </div>
    </AppLayout>
  );
};

export default BoardsPage;