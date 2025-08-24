import React from 'react';
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
import type { TaskStatus, Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { Column } from './Column';
import { TaskCard } from './TaskCard';

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
  const { state, dispatch } = useTaskContext();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return state.tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = state.tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const activeTask = state.tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if we're dropping on a column
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn && activeTask.status !== overColumn.id) {
      dispatch({
        type: 'MOVE_TASK',
        payload: { id: activeId, status: overColumn.id },
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropping on the same item, do nothing
    if (activeId === overId) return;

    // Find the active task
    const activeTask = state.tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping on another task (reordering within column)
    const overTask = state.tasks.find((t) => t.id === overId);
    if (overTask && activeTask.status === overTask.status) {
      // Reorder tasks within the same column
      const columnTasks = getTasksByStatus(activeTask.status);
      const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
      const overIndex = columnTasks.findIndex((t) => t.id === overId);

      // For now, we'll just rely on the visual reordering
      // In a more complex app, we might want to track task order
    }

    // Check if dropping on a column
    const overColumn = COLUMNS.find((col) => col.id === overId);
    if (overColumn && activeTask.status !== overColumn.id) {
      dispatch({
        type: 'MOVE_TASK',
        payload: { id: activeId, status: overColumn.id },
      });
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
      </div>
    </div>
  );
}
