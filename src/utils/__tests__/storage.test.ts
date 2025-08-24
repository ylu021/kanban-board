import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveTasksToStorage, loadTasksFromStorage } from '../storage';
import type { Task } from '../../types';

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
});
