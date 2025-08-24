export type TaskStatus = 'todo' | 'inProgress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskState {
  tasks: Task[];
}

export type TaskAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> }
  | {
      type: 'UPDATE_TASK';
      payload: { id: string; updates: Partial<Omit<Task, 'id' | 'createdAt'>> };
    }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { id: string; status: TaskStatus } }
  | {
      type: 'REORDER_TASK';
      payload: { status: string; reorderedTasks: Task[] };
    }
  | { type: 'LOAD_TASKS'; payload: Task[] };

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface HistoryEntry {
  id: string;
  action: 'created' | 'updated' | 'moved' | 'deleted' | 'reordered';
  taskTitle: string;
  timestamp: Date;
  details?: string;
}
