import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveTasksToStorage,
  loadTasksFromStorage,
  saveHistoryToStorage,
  loadHistoryFromStorage,
} from '../storage';
import type { Task, HistoryEntry } from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveTasksToStorage', () => {
    it('should save tasks to localStorage', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          status: 'todo',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      saveTasksToStorage(tasks);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kanbanTasks',
        JSON.stringify(tasks)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const tasks: Task[] = [];
      saveTasksToStorage(tasks);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save tasks to localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('loadTasksFromStorage', () => {
    it('should return empty array when no data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadTasksFromStorage();

      expect(result).toEqual([]);
    });

    it('should load and parse tasks from localStorage', () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Test Task',
          status: 'todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks));

      const result = loadTasksFromStorage();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Task');
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeInstanceOf(Date);
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = loadTasksFromStorage();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load tasks from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle invalid JSON gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = loadTasksFromStorage();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('saveHistoryToStorage', () => {
    it('should save history to localStorage with correct key', () => {
      const history: HistoryEntry[] = [
        {
          id: '1',
          action: 'created',
          taskTitle: 'Test Task',
          timestamp: new Date(),
        },
      ];

      saveHistoryToStorage(history);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kanbanHistory',
        JSON.stringify(history)
      );
    });

    it('should limit history to 5 entries when saving', () => {
      const history: HistoryEntry[] = Array.from({ length: 6 }, (_, i) => ({
        id: `${i}`,
        action: 'created' as const,
        taskTitle: `Task ${i}`,
        timestamp: new Date(),
      }));

      saveHistoryToStorage(history);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kanbanHistory',
        expect.any(String)
      );

      // Verify only last 5 entries were saved
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveLength(5);
    });
  });

  describe('loadHistoryFromStorage', () => {
    it('should return empty array when no history data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadHistoryFromStorage();

      expect(result).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('kanbanHistory');
    });

    it('should load and parse history from localStorage', () => {
      const mockHistory = [
        {
          id: '1',
          action: 'created',
          taskTitle: 'Test Task',
          timestamp: new Date().toISOString(),
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

      const result = loadHistoryFromStorage();

      expect(result).toHaveLength(1);
      expect(result[0].action).toBe('created');
      expect(result[0].taskTitle).toBe('Test Task');
      expect(result[0].timestamp).toBeInstanceOf(Date);
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = loadHistoryFromStorage();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load history from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle invalid JSON gracefully', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = loadHistoryFromStorage();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
