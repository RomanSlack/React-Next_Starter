'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/app/components/layout/AppLayout';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Loading } from '@/app/components/ui/Loading';
import {
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CalendarIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { questAPI, Quest, QuestDay } from '@/app/lib/api/quest';
import QuestTaskCard from '@/app/components/quest/QuestTaskCard';
import QuestArchiveComponent from '@/app/components/quest/QuestArchive';
import { QuestRolloverService } from '@/app/lib/services/questRollover';

const QuestPage: React.FC = () => {
  const [questDay, setQuestDay] = useState<QuestDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showArchive, setShowArchive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadTodayQuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await questAPI.getTodayQuests();
      setQuestDay(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestDay = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await questAPI.getQuestDay(date);
      setQuestDay(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load quest day');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayQuests();
    
    // Start auto-rollover service
    QuestRolloverService.startAutoRollover();
    
    // Cleanup on unmount
    return () => {
      QuestRolloverService.stopAutoRollover();
    };
  }, []);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const questData = {
        content: newTaskTitle.trim(),
      };

      await questAPI.createQuest(questData);
      await loadTodayQuests();
      
      // Reset form
      setNewTaskTitle('');
      setIsCreatingTask(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartCreating = () => {
    setIsCreatingTask(true);
    setNewTaskTitle('');
  };

  const handleCancelCreating = () => {
    setIsCreatingTask(false);
    setNewTaskTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      handleCancelCreating();
    }
  };

  const handleToggleComplete = async (questId: string, isComplete: boolean) => {
    try {
      await questAPI.toggleQuestComplete(questId, isComplete);
      await loadTodayQuests();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (questId: string) => {
    try {
      await questAPI.deleteQuest(questId);
      await loadTodayQuests();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleUpdateTask = async (questId: string, updates: Partial<Quest>) => {
    try {
      await questAPI.updateQuest(questId, updates);
      await loadTodayQuests();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && questDay) {
      const oldIndex = questDay.quests.findIndex((quest) => quest.id === active.id);
      const newIndex = questDay.quests.findIndex((quest) => quest.id === over.id);

      const newQuests = arrayMove(questDay.quests, oldIndex, newIndex);
      
      // Update local state immediately for better UX
      setQuestDay({
        ...questDay,
        quests: newQuests
      });

      try {
        // Prepare reorder data
        const questOrders = newQuests.map((quest, index) => ({
          quest_id: quest.id,
          new_order_index: index + 1
        }));

        await questAPI.reorderQuests(questOrders);
      } catch (err: any) {
        // Revert on error
        setError(err.message || 'Failed to reorder tasks');
        await loadTodayQuests();
      }
    }
  };

  const handleRolloverFromYesterday = async () => {
    try {
      const result = await QuestRolloverService.manualRollover();
      
      if (result.success) {
        if (result.count > 0) {
          setError(null); // Clear any existing errors
          // Could show a success message here
        }
        await loadTodayQuests();
      } else {
        setError(result.error || 'Failed to rollover tasks');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to rollover tasks');
    }
  };

  const handleSelectArchiveDate = async (date: string) => {
    try {
      setCurrentDate(new Date(date));
      await loadQuestDay(date);
      setShowArchive(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load selected date');
    }
  };

  const handleBackToToday = async () => {
    setCurrentDate(new Date());
    await loadTodayQuests();
  };

  const getTaskDueStatus = (quest: Quest) => {
    if (!quest.date_due) return null;
    
    const dueDate = new Date(quest.date_due);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today) return 'overdue';
    if (dueDate.getTime() === today.getTime()) return 'due-today';
    return 'future';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loading size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quest</h1>
            <p className="mt-1 text-lg text-muted-foreground">
              {questDay ? (() => {
                const questDate = new Date(questDay.date);
                const today = new Date();
                const isQuestToday = questDate.toDateString() === today.toDateString();
                
                if (isQuestToday) {
                  return 'Today - Your daily tasks';
                } else {
                  return questDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                }
              })() : 'Your daily tasks'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {questDay && new Date(questDay.date).toDateString() !== new Date().toDateString() && (
              <Button
                variant="outline"
                onClick={handleBackToToday}
                icon={<CalendarIcon className="w-4 h-4" />}
              >
                Back to Today
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleRolloverFromYesterday}
              icon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Roll from Yesterday
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowArchive(!showArchive)}
              icon={<ArchiveBoxIcon className="w-4 h-4" />}
            >
              Archive
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Archive View */}
        {showArchive && (
          <QuestArchiveComponent
            onClose={() => setShowArchive(false)}
            onSelectDate={handleSelectArchiveDate}
          />
        )}

        {/* Main Quest Interface */}
        {!showArchive && (
        <Card>
          <CardHeader
            title={`Today's Quests`}
            subtitle={questDay ? `${questDay.completed_count}/${questDay.total_count} completed` : ''}
          />
          <CardContent>

            {/* Quest List */}
            <div className="space-y-2">
              {/* Inline task creation */}
              {isCreatingTask && (
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg shadow-sm">
                  <div className="w-5 h-5 rounded border border-border"></div>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={() => {
                      if (!newTaskTitle.trim()) {
                        handleCancelCreating();
                      } else {
                        handleAddTask();
                      }
                    }}
                    placeholder="What needs to be done?"
                    className="flex-1 text-sm border-none outline-none placeholder-muted-foreground bg-transparent text-foreground"
                    autoFocus
                    disabled={isSubmitting}
                  />
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                  )}
                </div>
              )}

              {/* Existing quests */}
              {questDay && questDay.quests.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext 
                    items={questDay.quests.map(q => q.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    {questDay.quests.map((quest) => (
                      <QuestTaskCard
                        key={quest.id}
                        quest={quest}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                        onUpdate={handleUpdateTask}
                        dueStatus={getTaskDueStatus(quest)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : !isCreatingTask ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">
                    <CheckIcon className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No quests yet. Start by adding your first task.
                  </p>
                </div>
              ) : null}

              {/* Add task button */}
              {!isCreatingTask && (
                <button
                  onClick={handleStartCreating}
                  className="flex items-center gap-3 p-3 w-full text-left bg-muted hover:bg-muted/80 border border-dashed border-border hover:border-accent rounded-lg transition-colors group"
                >
                  <PlusIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    Add a quest
                  </span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Progress Summary */}
        {!showArchive && questDay && questDay.total_count > 0 && (
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {questDay.completed_count}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {questDay.pending_count}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round((questDay.completed_count / questDay.total_count) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Progress</div>
                  </div>
                </div>
                
                <div className="w-48 bg-muted rounded-full h-4">
                  <div
                    className="bg-accent h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${(questDay.completed_count / questDay.total_count) * 100}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default QuestPage;