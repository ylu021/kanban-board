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

  const moveTaskWithin = (
    status: TaskStatus,
    columnName: string,
    activeIndex: number,
    overIndex: number
  ) => {
    const columnTasks = taskContext.state.tasks.filter(
      (task) => task.status === status
    );
    const reorderedTasks = [...columnTasks];
    const [movedTask] = reorderedTasks.splice(activeIndex, 1);
    reorderedTasks.splice(overIndex, 0, movedTask);
    // let index = 0;
    // const updatedTasks = taskContext.state.tasks.map((task) => {
    //   if (task.status === status) {
    //     // replace with reordered
    //     return reorderedTasks[index++];
    //   }
    //   return task;
    // });
    taskContext.dispatch({
      type: 'REORDER_TASK',
      payload: { status, reorderedTasks },
    });
    historyContext.addHistory({
      action: 'moved',
      taskTitle: movedTask.title,
      details: `within ${columnName}`,
    });
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
    moveTaskWithin,
    addMoveHistory,
    addTaskWithHistory,
    updateTaskWithHistory,
    deleteTaskWithHistory,
  };
}
