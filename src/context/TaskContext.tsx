import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskState, TaskAction } from '../types';
import { saveTasksToStorage, loadTasksFromStorage } from '../utils/storage';

const initialState: TaskState = {
  tasks: [],
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const newState = {
        ...state,
        tasks: [...state.tasks, newTask],
      };
      saveTasksToStorage(newState.tasks);
      return newState;
    }

    case 'UPDATE_TASK': {
      const newState = {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        ),
      };
      saveTasksToStorage(newState.tasks);
      return newState;
    }

    case 'DELETE_TASK': {
      const newState = {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
      saveTasksToStorage(newState.tasks);
      return newState;
    }

    case 'MOVE_TASK': {
      const newState = {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, status: action.payload.status, updatedAt: new Date() }
            : task
        ),
      };
      saveTasksToStorage(newState.tasks);
      return newState;
    }

    case 'REORDER_TASK': {
      const { status, reorderedTasks } = action.payload;
      let index = 0;
      const newState = {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.status === status) {
            return reorderedTasks?.[index++] || task;
          }
          return task;
        }),
      };

      saveTasksToStorage(newState.tasks);
      return newState;
    }

    case 'LOAD_TASKS': {
      return {
        ...state,
        tasks: action.payload,
      };
    }

    default:
      return state;
  }
}

interface TaskContextValue {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  useEffect(() => {
    const savedTasks = loadTasksFromStorage();
    if (savedTasks.length > 0) {
      dispatch({ type: 'LOAD_TASKS', payload: savedTasks });
    }
  }, []);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
