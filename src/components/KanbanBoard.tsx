import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { useTaskAndHistory } from '../hooks/useTaskAndHistory';
import type { Task, TaskStatus } from '../types';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { EnhancedTaskFilter } from './enhanced/TaskFilter';
import { EnhancedTaskHistoryLog } from './enhanced/TaskHistoryLog';

const COLUMNS: Array<{
  id: TaskStatus;
  title: string;
  textColorClass: string;
}> = [
  { id: 'todo', title: 'To Do', textColorClass: 'text-primary-500' },
  { id: 'inProgress', title: 'In Progress', textColorClass: 'text-orange-500' },
  { id: 'done', title: 'Done', textColorClass: 'text-green-500' },
];

export function KanbanBoard() {
  const {
    tasks,
    moveTask,
    addMoveHistory,
    addReorderedHistory,
    moveTaskWithin,
  } = useTaskAndHistory();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [originalStatus, setOriginalStatus] = useState<TaskStatus | null>(null);
  const [filterKeyword, setFilterKeyword] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredTasks = useMemo(() => {
    if (!filterKeyword.trim()) return tasks;

    const keyword = filterKeyword.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(keyword) ||
        (task.description && task.description.toLowerCase().includes(keyword))
    );
  }, [tasks, filterKeyword]);

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
    setOriginalStatus(task?.status || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if we're dropping on a column
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn && activeTask.status !== overColumn.id) {
      moveTask(activeId, overColumn.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    const finalTask = tasks.find((t) => t.id === active.id);
    setActiveTask(null);
    let historyAdded = false;
    if (finalTask && finalTask?.status !== originalStatus) {
      addMoveHistory(finalTask?.title, finalTask?.status);
      historyAdded = true;
    }
    setOriginalStatus(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropping on the same item, do nothing
    if (activeId === overId) return;

    // Find the active task
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping on another task (reordering within column)
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && activeTask.status === overTask.status) {
      // Reorder tasks within the same column
      const columnTasks = getTasksByStatus(activeTask.status);
      const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
      const overIndex = columnTasks.findIndex((t) => t.id === overId);
      const columnName = COLUMNS.find(
        (col) => col.id === finalTask?.status
      )?.title;

      if (activeIndex !== overIndex && finalTask && columnName) {
        moveTaskWithin(finalTask.status, activeIndex, overIndex);
        if (!historyAdded) {
          addReorderedHistory(finalTask.title, columnName);
        }
      }
    }

    // Check if dropping on a column
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn && activeTask.status !== overColumn.id) {
      moveTask(activeId, overColumn.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kanban Task Board
          </h1>
          <p className="text-gray-600">
            Organize your tasks with drag & drop functionality
          </p>
        </header>

        <EnhancedTaskHistoryLog />
        <div className="mt-6">
          <EnhancedTaskFilter onFilterChange={setFilterKeyword} />
        </div>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map((column) => (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                textColorClass={column.textColorClass}
                tasks={getTasksByStatus(column.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3">
                <TaskCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        {filterKeyword && filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search keywords or create a new task.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
