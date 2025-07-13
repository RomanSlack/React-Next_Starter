'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { 
  PlusIcon, 
  EllipsisHorizontalIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  StarIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { boardsAPI } from '@/app/lib/api/boards';
import { Board, Card as BoardCard } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const BoardDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  
  const [board, setBoard] = useState<Board | null>(null);
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingBoard, setEditingBoard] = useState(false);
  const [newCardStatus, setNewCardStatus] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<BoardCard | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [cardForm, setCardForm] = useState({ title: '', description: '', priority: 'medium' });
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boardId) {
      fetchBoard();
      fetchCards();
    }
  }, [boardId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBoard = async () => {
    try {
      const boardData = await boardsAPI.getBoard(boardId);
      setBoard(boardData);
      setEditForm({ title: boardData.title, description: boardData.description || '' });
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError('Failed to load board');
    }
  };

  const fetchCards = async () => {
    try {
      const cardsData = await boardsAPI.getBoardCards(boardId);
      setCards(cardsData);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (status: string) => {
    try {
      const newCard = await boardsAPI.createCard(boardId, {
        title: cardForm.title || 'New Card',
        description: cardForm.description || 'Add a description',
        status,
        priority: cardForm.priority
      });
      setCards([...cards, newCard]);
      setNewCardStatus(null);
      setCardForm({ title: '', description: '', priority: 'medium' });
    } catch (err) {
      console.error('Failed to create card:', err);
      setError('Failed to create card');
    }
  };

  const handleUpdateCard = async (cardId: string, updates: Partial<BoardCard>) => {
    try {
      const updatedCard = await boardsAPI.updateCard(cardId, updates);
      setCards(cards.map(card => card.id === cardId ? updatedCard : card));
      setEditingCard(null);
    } catch (err) {
      console.error('Failed to update card:', err);
      setError('Failed to update card');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
      await boardsAPI.deleteCard(cardId);
      setCards(cards.filter(card => card.id !== cardId));
    } catch (err) {
      console.error('Failed to delete card:', err);
      setError('Failed to delete card');
    }
  };

  const handleMoveCard = async (cardId: string, newStatus: string, newPosition: number) => {
    try {
      const updatedCard = await boardsAPI.moveCard(cardId, boardId, newStatus, newPosition);
      setCards(cards.map(card => card.id === cardId ? updatedCard : card));
    } catch (err) {
      console.error('Failed to move card:', err);
      setError('Failed to move card');
    }
  };

  const handleUpdateBoard = async (updates: Partial<Board>) => {
    if (!board) return;
    try {
      const updatedBoard = await boardsAPI.updateBoard(boardId, updates);
      setBoard(updatedBoard);
      setEditingBoard(false);
    } catch (err) {
      console.error('Failed to update board:', err);
      setError('Failed to update board');
    }
  };

  const handleDeleteBoard = async () => {
    if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) return;
    try {
      await boardsAPI.deleteBoard(boardId);
      router.push('/boards');
    } catch (err) {
      console.error('Failed to delete board:', err);
      setError('Failed to delete board');
    }
  };

  const handleToggleStar = async () => {
    if (!board) return;
    await handleUpdateBoard({ is_starred: !board.is_starred });
  };

  const handleArchiveBoard = async () => {
    if (!board) return;
    if (!confirm('Are you sure you want to archive this board?')) return;
    await handleUpdateBoard({ is_archived: true });
    router.push('/boards');
  };

  const handleDragStart = (e: React.DragEvent, card: BoardCard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedCard) return;

    if (draggedCard.status !== newStatus) {
      const cardsInNewStatus = getCardsByStatus(newStatus);
      const newPosition = cardsInNewStatus.length;
      await handleMoveCard(draggedCard.id, newStatus, newPosition);
    }
    setDraggedCard(null);
  };

  const getCardsByStatus = (status: string) => {
    return cards.filter(card => card.status === status).sort((a, b) => a.position - b.position);
  };

  const columns = board?.settings?.columns || [
    { id: 'todo', title: 'To Do', color: '#ef4444' },
    { id: 'in_progress', title: 'In Progress', color: '#f59e0b' },
    { id: 'done', title: 'Done', color: '#10b981' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !board) {
    return (
      <AppLayout>
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent padding="lg">
              <div className="text-center text-red-600">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error || 'Board not found'}</p>
                <div className="mt-4 space-x-2">
                  <Link href="/boards">
                    <Button variant="ghost" size="sm">
                      Back to Boards
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/boards">
              <Button variant="ghost" size="sm" icon={<ArrowLeftIcon className="w-4 h-4" />}>
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded" 
                style={{ backgroundColor: board.color }}
              />
              {editingBoard ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="text-3xl font-bold bg-transparent border-b-2 border-grape-300 focus:border-grape-500 outline-none"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<CheckIcon className="w-4 h-4" />}
                      onClick={() => handleUpdateBoard(editForm)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<XMarkIcon className="w-4 h-4" />}
                      onClick={() => {
                        setEditingBoard(false);
                        setEditForm({ title: board.title, description: board.description || '' });
                      }}
                    />
                  </div>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Board description"
                    className="w-full p-2 text-gray-600 bg-transparent border border-gray-300 rounded focus:border-grape-500 outline-none resize-none"
                    rows={2}
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{board.title}</h1>
                  <p className="text-gray-600">{board.description}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={board.is_starred ? <StarIconSolid className="w-4 h-4 text-yellow-500" /> : <StarIcon className="w-4 h-4" />}
              onClick={handleToggleStar}
            >
              {board.is_starred ? 'Starred' : 'Star'}
            </Button>
            
            <div className="relative" ref={optionsMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              >
                Options
              </Button>
              
              {showOptionsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      setEditingBoard(true);
                      setShowOptionsMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Board
                  </button>
                  <button
                    onClick={() => {
                      handleArchiveBoard();
                      setShowOptionsMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                    Archive Board
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => {
                      handleDeleteBoard();
                      setShowOptionsMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Board
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-4">
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

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div 
              key={column.id} 
              className="bg-gray-50 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-medium text-foreground">{column.title}</h3>
                  <span className="text-sm text-gray-500">
                    ({getCardsByStatus(column.id).length})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => setNewCardStatus(column.id)}
                >
                  Add
                </Button>
              </div>

              {/* Add Card Form */}
              {newCardStatus === column.id && (
                <Card className="mb-3 p-3 bg-white shadow-sm">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Card title"
                      value={cardForm.title}
                      onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-grape-500"
                      autoFocus
                    />
                    <textarea
                      placeholder="Card description"
                      value={cardForm.description}
                      onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-grape-500"
                      rows={2}
                    />
                    <select
                      value={cardForm.priority}
                      onChange={(e) => setCardForm({ ...cardForm, priority: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-grape-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleCreateCard(column.id)}
                        disabled={!cardForm.title.trim()}
                      >
                        Add Card
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNewCardStatus(null);
                          setCardForm({ title: '', description: '', priority: 'medium' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Cards */}
              <div className="space-y-3">
                {getCardsByStatus(column.id).map((card) => (
                  <Card 
                    key={card.id} 
                    className={cn(
                      "p-3 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer",
                      draggedCard?.id === card.id && "opacity-50"
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                  >
                    {editingCard === card.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                          className="w-full font-medium bg-transparent border-b border-gray-200 focus:border-grape-500 outline-none"
                          autoFocus
                        />
                        <textarea
                          value={card.description || ''}
                          onChange={(e) => handleUpdateCard(card.id, { description: e.target.value })}
                          className="w-full text-sm text-gray-600 bg-transparent border border-gray-200 rounded p-1 focus:border-grape-500 outline-none"
                          rows={2}
                        />
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingCard(null)}
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground flex-1">{card.title}</h4>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<PencilIcon className="w-3 h-3" />}
                              onClick={() => setEditingCard(card.id)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<TrashIcon className="w-3 h-3" />}
                              onClick={() => handleDeleteCard(card.id)}
                            />
                          </div>
                        </div>
                        {card.description && (
                          <p className="text-sm text-gray-600 mb-2">{card.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "inline-flex px-2 py-1 rounded-full text-xs font-medium border",
                            getPriorityColor(card.priority)
                          )}>
                            {card.priority}
                          </span>
                          {card.completed_at && (
                            <span className="text-xs text-green-600">
                              ✓ {new Date(card.completed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default BoardDetailPage;