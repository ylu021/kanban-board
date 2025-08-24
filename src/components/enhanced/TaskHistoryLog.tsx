import React, { useState } from 'react';
import type { HistoryEntry } from '../../types';
import { useTaskAndHistory } from '../../hooks/useTaskAndHistory';

export function EnhancedTaskHistoryLog() {
  const [isOpen, setIsOpen] = useState(false);
  const { history, clearHistory } = useTaskAndHistory();

  const getActionText = (entry: HistoryEntry) => {
    switch (entry.action) {
      case 'created':
        return `Created task "${entry.taskTitle}"`;
      case 'updated':
        return `Updated task ${entry.prevTitle} to "${entry.taskTitle}"`;
      case 'moved':
        return `Moved task "${entry.taskTitle}"${entry.details ? ` to ${entry.details}` : ''}`;
      case 'reordered':
        return `Reordered task "${entry.taskTitle}" in ${entry.details}`;
      case 'deleted':
        return `Deleted task "${entry.taskTitle}"`;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (history.length === 0) return null;

  return (
    <div className="flex justify-end">
      <div className="relative text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>📝</span>
          <span>History ({history.length})</span>
          <span
            className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            ▼
          </span>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-up">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">Recent Activity</h3>
                <button
                  onClick={clearHistory}
                  className="text-primary-500 hover:text-primary-600"
                >
                  Clear All
                </button>
              </div>
              <hr className="text-gray-300 pb-2" />

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {history
                  .slice(-5)
                  .reverse()
                  .map((entry) => (
                    <div key={entry.id} className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {getActionText(entry)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
