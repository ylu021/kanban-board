import { useHistoryContext } from '../context/HistoryContext';
import { useTaskContext } from '../context/TaskContext';
import type { Task, TaskStatus } from '../types';

export function useTaskAndHistory() {
  const taskContext = useTaskContext();
  const historyContext = useHistoryContext();

  // Enhanced task operations with automatic history tracking
  const addTaskWithHistory = (
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    taskContext.dispatch({ type: 'ADD_TASK', payload: task });
    historyContext.addHistory({
      action: 'created',
      taskTitle: task.title,
    });
  };

  const updateTaskWithHistory = (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ) => {
    const task = taskContext.state.tasks.find((t) => t.id === id);
    if (!task) return;

    taskContext.dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    historyContext.addHistory({
      action: 'updated',
      taskTitle: updates.title || task.title,
    });
  };

  const moveTask = (id: string, status: TaskStatus) => {
    taskContext.dispatch({ type: 'MOVE_TASK', payload: { id, status } });
  };

  const addMoveHistory = (taskTitle: string, details: string) => {
    historyContext.addHistory({
      action: 'moved',
      taskTitle,
      details,
    });
  };

  const deleteTaskWithHistory = (id: string) => {
    const task = taskContext.state.tasks.find((t) => t.id === id);
    if (!task) return;

    taskContext.dispatch({ type: 'DELETE_TASK', payload: id });
    historyContext.addHistory({
      action: 'deleted',
      taskTitle: task.title,
    });
  };

  return {
    // Task state and original dispatch
    tasks: taskContext.state.tasks,
    taskDispatch: taskContext.dispatch,

    // History state and methods
    history: historyContext.state.history,
    historyDispatch: historyContext.dispatch,
    addHistory: historyContext.addHistory,
    clearHistory: historyContext.clearHistory,
    moveTask,
    addMoveHistory,
    addTaskWithHistory,
    updateTaskWithHistory,
    deleteTaskWithHistory,
  };
}
