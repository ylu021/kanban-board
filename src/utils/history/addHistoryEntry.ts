import type { HistoryEntry } from '../../types';
import { loadHistoryFromStorage, saveHistoryToStorage } from '../storage';

export function addHistoryEntry(
  currentHistory: HistoryEntry[],
  newEntry: Omit<HistoryEntry, 'id' | 'timestamp'>
): HistoryEntry[] {
  const historyEntry: HistoryEntry = {
    ...newEntry,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
  };

  // Add new entry and keep only last 5
  const updatedHistory = [...currentHistory.slice(-4), historyEntry];

  // Save to storage
  saveHistoryToStorage(updatedHistory);

  return updatedHistory;
}
