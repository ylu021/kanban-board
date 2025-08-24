import type { HistoryEntry } from '../components/enhanced/TaskHistoryLog';
import type { Task } from '../types';

const TASK_STORAGE_KEY = 'kanbanTasks';
const HISTORY_STORAGE_KEY = 'kanbanHistory';

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

export function loadTasksFromStorage(): Task[] {
  try {
    const stored = localStorage.getItem(TASK_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((task: Task) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
}

export function saveHistoryToStorage(history: HistoryEntry[]): void {
  try {
    // Only keep last 5 entries before saving
    const limitedHistory = history.slice(-5);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to save history to localStorage:', error);
  }
}

export function loadHistoryFromStorage(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((entry: HistoryEntry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
    return [];
  }
}
