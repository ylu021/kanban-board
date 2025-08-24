import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { SquarePen, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { dispatch } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          id: task.id,
          updates: { title: editTitle.trim() },
        },
      });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-2 cursor-grab active:cursor-grabbing transition-all duration-200 ${
          isDragging ? 'opacity-50 scale-105 shadow-lg' : 'hover:shadow-md'
        }`}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-start justify-between">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyPress}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0"
              autoFocus
            />
          ) : (
            <div
              className="inline-flex gap-2 items-center"
              onClick={() => setIsEditing(true)}
            >
              <h3 className="flex-1 text-sm font-medium text-gray-900 cursor-pointer hover:text-primary-600 transition-colors">
                {task.title}
              </h3>
              <SquarePen className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400 mt-4">
          <div>
            Created At:{' '}
            {new Date(task.createdAt).toLocaleDateString('en-US', {
              weekday: 'short', // e.g. "Mon"
              year: 'numeric',
              month: 'short', // e.g. "Aug"
              day: 'numeric',
            })}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="text-gray-400 hover:text-red-500 transition-colors ml-2 opacity-100 group-hover:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        taskTitle={task.title}
      />
    </>
  );
}
