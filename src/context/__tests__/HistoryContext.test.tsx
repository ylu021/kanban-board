import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { HistoryProvider, useHistoryContext } from '../HistoryContext';

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <HistoryProvider>{children}</HistoryProvider>
);

describe('HistoryContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should provide initial empty history state', () => {
    const { result } = renderHook(() => useHistoryContext(), { wrapper });

    expect(result.current.state.history).toEqual([]);
  });

  it('should add history entry with convenience method', () => {
    const { result } = renderHook(() => useHistoryContext(), { wrapper });

    act(() => {
      result.current.addHistory({
        action: 'created',
        taskTitle: 'Test Task',
      });
    });

    expect(result.current.state.history).toHaveLength(1);
    expect(result.current.state.history[0].action).toBe('created');
    expect(result.current.state.history[0].taskTitle).toBe('Test Task');
    expect(result.current.state.history[0].id).toBeDefined();
    expect(result.current.state.history[0].timestamp).toBeInstanceOf(Date);
  });

  it('should maintain FIFO eviction when adding 6th entry', () => {
    const { result } = renderHook(() => useHistoryContext(), { wrapper });

    // Add 5 history entries
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.addHistory({
          action: 'created',
          taskTitle: `Task ${i}`,
        });
      }
    });

    // Get the first entry ID to verify it gets evicted
    const firstEntryId = result.current.state.history[0].id;

    // Add 6th entry
    act(() => {
      result.current.addHistory({
        action: 'created',
        taskTitle: 'Task 5',
      });
    });

    // Should still have 5 entries
    expect(result.current.state.history).toHaveLength(5);

    // First entry should be evicted
    expect(
      result.current.state.history.find((entry) => entry.id === firstEntryId)
    ).toBeUndefined();

    // Last entry should be the new one
    expect(result.current.state.history[4].taskTitle).toBe('Task 5');
  });

  it('should clear all history', () => {
    const { result } = renderHook(() => useHistoryContext(), { wrapper });

    // Add some history
    act(() => {
      result.current.addHistory({
        action: 'created',
        taskTitle: 'Test Task',
      });
    });

    expect(result.current.state.history).toHaveLength(1);

    // Clear history
    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.state.history).toHaveLength(0);
  });

  it('should load history from localStorage on mount', () => {
    const mockHistory = [
      {
        id: 'test-1',
        action: 'created',
        taskTitle: 'Loaded Task',
        timestamp: new Date().toISOString(),
      },
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

    const { result } = renderHook(() => useHistoryContext(), { wrapper });

    expect(result.current.state.history).toHaveLength(1);
    expect(result.current.state.history[0].taskTitle).toBe('Loaded Task');
    expect(result.current.state.history[0].timestamp).toBeInstanceOf(Date);
  });

  it('should save to localStorage when adding history', () => {
    const { result } = renderHook(() => useHistoryContext(), { wrapper });

    act(() => {
      result.current.addHistory({
        action: 'created',
        taskTitle: 'Test Task',
      });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'kanbanHistory',
      expect.any(String)
    );
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useHistoryContext());
    }).toThrow('useHistoryContext must be used within a HistoryProvider');
  });
});
