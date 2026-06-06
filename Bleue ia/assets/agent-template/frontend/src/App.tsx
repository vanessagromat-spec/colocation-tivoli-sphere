import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Chat } from './components/Chat';
import { AgentPanel } from './components/AgentPanel';
import { CRM } from './components/CRM';
import { Projects } from './components/Projects';
import { Documents } from './components/Documents';
import { Settings } from './components/Settings';

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/agent" element={<AgentPanel />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
 useEffect(() => {
    document.title = "Bleue IA";
  }, []);  

return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
