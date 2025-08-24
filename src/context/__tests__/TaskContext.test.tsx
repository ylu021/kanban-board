import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TaskProvider, useTaskContext } from '../TaskContext';

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
  <TaskProvider>{children}</TaskProvider>
);

describe('TaskContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should provide initial empty state', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    expect(result.current.state.tasks).toEqual([]);
  });

  it('should add a new task', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: {
          title: 'Test Task',
          description: 'Test Description',
          status: 'todo',
        },
      });
    });

    expect(result.current.state.tasks).toHaveLength(1);
    expect(result.current.state.tasks[0].title).toBe('Test Task');
    expect(result.current.state.tasks[0].status).toBe('todo');
    expect(result.current.state.tasks[0].id).toBeDefined();
    expect(result.current.state.tasks[0].createdAt).toBeInstanceOf(Date);
  });

  it('should update a task', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    // Add a task first
    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: {
          title: 'Test Task',
          status: 'todo',
        },
      });
    });

    const taskId = result.current.state.tasks[0].id;

    // Update the task
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_TASK',
        payload: {
          id: taskId,
          updates: { title: 'Updated Task' },
        },
      });
    });

    expect(result.current.state.tasks[0].title).toBe('Updated Task');
    expect(result.current.state.tasks[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should move a task to different status', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    // Add a task
    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: {
          title: 'Test Task',
          status: 'todo',
        },
      });
    });

    const taskId = result.current.state.tasks[0].id;

    // Move the task
    act(() => {
      result.current.dispatch({
        type: 'MOVE_TASK',
        payload: {
          id: taskId,
          status: 'inProgress',
        },
      });
    });

    expect(result.current.state.tasks[0].status).toBe('inProgress');
  });

  it.only('should reorder tasks within a column', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: { title: 'Task 1', status: 'todo' },
      });
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: { title: 'Task 2', status: 'todo' },
      });
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: { title: 'Task 3', status: 'todo' },
      });
    });

    const columnTasks = result.current.state.tasks.filter(
      (t) => t.status === 'todo'
    );

    expect(columnTasks.map((t) => t.title)).toEqual([
      'Task 1',
      'Task 2',
      'Task 3',
    ]);

    const reorderedTasks = [columnTasks[2], columnTasks[0], columnTasks[1]];

    act(() => {
      result.current.dispatch({
        type: 'REORDER_TASK',
        payload: {
          status: 'todo',
          reorderedTasks,
        },
      });
    });
    const updatedColumnTasks = result.current.state.tasks.filter(
      (t) => t.status === 'todo'
    );

    expect(updatedColumnTasks.map((t) => t.title)).toEqual([
      'Task 3',
      'Task 1',
      'Task 2',
    ]);
  });

  it('should delete a task', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    // Add a task
    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: {
          title: 'Test Task',
          status: 'todo',
        },
      });
    });

    const taskId = result.current.state.tasks[0].id;

    // Delete the task
    act(() => {
      result.current.dispatch({
        type: 'DELETE_TASK',
        payload: taskId,
      });
    });

    expect(result.current.state.tasks).toHaveLength(0);
  });

  it('should save to localStorage on actions', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: 'ADD_TASK',
        payload: {
          title: 'Test Task',
          status: 'todo',
        },
      });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'kanbanTasks',
      expect.any(String)
    );
  });
});
