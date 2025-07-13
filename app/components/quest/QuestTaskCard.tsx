'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CalendarIcon,
  Bars3Icon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { Quest } from '@/app/lib/api/quest';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';

interface QuestTaskCardProps {
  quest: Quest;
  onToggleComplete: (questId: string, isComplete: boolean) => void;
  onDelete: (questId: string) => void;
  onUpdate: (questId: string, updates: Partial<Quest>) => void;
  dueStatus?: 'overdue' | 'due-today' | 'future' | null;
}

const QuestTaskCard: React.FC<QuestTaskCardProps> = ({
  quest,
  onToggleComplete,
  onDelete,
  onUpdate,
  dueStatus
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(quest.content);
  const [editDueDate, setEditDueDate] = useState(quest.date_due || '');
  const [editDueTime, setEditDueTime] = useState(quest.time_due || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quest.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== quest.content) {
      onUpdate(quest.id, {
        content: editContent.trim(),
        date_due: editDueDate || undefined,
        time_due: editDueTime || undefined,
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(quest.content);
    setEditDueDate(quest.date_due || '');
    setEditDueTime(quest.time_due || '');
    setIsEditing(false);
  };

  const getDueStatusColor = () => {
    switch (dueStatus) {
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'due-today':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'future':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-muted-foreground bg-gray-50 border-gray-200';
    }
  };

  const formatDueDateTime = () => {
    if (!quest.date_due) return null;
    
    const dateStr = format(new Date(quest.date_due), 'MMM d');
    if (quest.time_due) {
      const [hours, minutes] = quest.time_due.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      return `${dateStr} at ${format(time, 'h:mm a')}`;
    }
    return dateStr;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center space-x-3 p-4 bg-white border rounded-lg
        transition-all duration-200 hover:shadow-md
        ${quest.is_complete ? 'bg-gray-50 border-gray-200' : 'border-gray-300'}
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Bars3Icon className="w-5 h-5 text-gray-400" />
      </div>

      {/* Completion Checkbox */}
      <button
        onClick={() => onToggleComplete(quest.id, !quest.is_complete)}
        className={`
          flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-200
          ${quest.is_complete
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
          }
        `}
      >
        {quest.is_complete && <CheckIconSolid className="w-4 h-4" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Task content"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                placeholder="Due date"
              />
              <Input
                type="time"
                value={editDueTime}
                onChange={(e) => setEditDueTime(e.target.value)}
                placeholder="Due time"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p
              className={`text-sm ${
                quest.is_complete
                  ? 'line-through text-muted-foreground'
                  : 'text-gray-900'
              }`}
            >
              {quest.content}
            </p>
            
            {/* Due Date/Time */}
            {formatDueDateTime() && (
              <div className={`
                inline-flex items-center space-x-1 mt-2 px-2 py-1 rounded-full text-xs border
                ${getDueStatusColor()}
              `}>
                <ClockIcon className="w-3 h-3" />
                <span>{formatDueDateTime()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex-shrink-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(quest.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestTaskCard;