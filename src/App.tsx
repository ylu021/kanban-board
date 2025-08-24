import './App.css';
import { TaskProvider } from './context/TaskContext';
import { KanbanBoard } from './components/KanbanBoard';
import { HistoryProvider } from './context/HistoryContext';

function App() {
  return (
    <>
      <TaskProvider>
        <HistoryProvider>
          <KanbanBoard />
        </HistoryProvider>
      </TaskProvider>
    </>
  );
}

export default App;
