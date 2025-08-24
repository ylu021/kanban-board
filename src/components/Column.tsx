import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { AddTaskForm } from './AddTaskForm';

interface ColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  textColorClass: string;
}

export function Column({ id, title, tasks, textColorClass }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 max-h-[400px] md:min-h-[600px] overflow-y-auto snap-y transition-colors duration-200 ${
        isOver
          ? 'bg-primary-50 border-2 border-primary-200'
          : 'border-2 border-dashed border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className={`font-semibold text-sm uppercase tracking-wide ${textColorClass}`}
        >
          {title}
        </h2>
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <div key={task.id} className="group">
              <TaskCard task={task} />
            </div>
          ))}
        </SortableContext>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-sm">No tasks yet</p>
          <p className="text-xs">Drag tasks here or add a new one</p>
        </div>
      )}

      <AddTaskForm status={id} />
    </div>
  );
}
