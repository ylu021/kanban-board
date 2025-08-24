import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadHistoryFromStorage, saveHistoryToStorage } from '../utils/storage';
import type { HistoryEntry } from '../types';
import { addHistoryEntry } from '../utils/history/addHistoryEntry';

interface HistoryState {
  history: HistoryEntry[];
}

type HistoryAction =
  | { type: 'LOAD_HISTORY'; payload: HistoryEntry[] }
  | { type: 'ADD_HISTORY'; payload: Omit<HistoryEntry, 'id' | 'timestamp'> }
  | { type: 'CLEAR_HISTORY' };

const initialState: HistoryState = {
  history: [],
};

function historyReducer(
  state: HistoryState,
  action: HistoryAction
): HistoryState {
  switch (action.type) {
    case 'LOAD_HISTORY': {
      return {
        ...state,
        history: action.payload,
      };
    }

    case 'ADD_HISTORY': {
      const updatedHistory = addHistoryEntry(state.history, action.payload);
      return {
        ...state,
        history: updatedHistory,
      };
    }

    case 'CLEAR_HISTORY': {
      saveHistoryToStorage([]);
      return {
        ...state,
        history: [],
      };
    }

    default:
      return state;
  }
}

interface HistoryContextValue {
  state: HistoryState;
  dispatch: React.Dispatch<HistoryAction>;
  // Convenience methods
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(historyReducer, initialState);

  // Load history from storage on mount
  useEffect(() => {
    const savedHistory = loadHistoryFromStorage();
    if (savedHistory.length > 0) {
      dispatch({ type: 'LOAD_HISTORY', payload: savedHistory });
    }
  }, []);

  // Convenience methods
  const addHistory = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_HISTORY', payload: entry });
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  return (
    <HistoryContext.Provider
      value={{ state, dispatch, addHistory, clearHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistoryContext() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
}
