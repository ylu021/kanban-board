import React, { useState, useRef, useEffect } from 'react';
import type { TaskStatus } from '../types';
import { useTaskContext } from '../context/TaskContext';

interface AddTaskFormProps {
  status: TaskStatus;
}

export function AddTaskForm({ status }: AddTaskFormProps) {
  const { dispatch } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
      },
    });

    // Reset form
    setTitle('');
    setDescription('');
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full py-2 px-3 text-sm text-primary-500 hover:text-gray-700 hover:bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <span className="text-lg">+</span>
        <span>Add a task</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
    >
      <input
        ref={titleInputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter task title..."
        className="w-full text-sm font-medium placeholder-gray-400 border-none outline-none focus:ring-0 p-0 mb-2"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a description (optional)..."
        className="w-full text-xs text-gray-600 placeholder-gray-400 border-none outline-none focus:ring-0 p-0 resize-none"
        rows={2}
      />

      <div className="flex justify-end space-x-2 mt-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-3 py-1 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded transition-colors"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}
