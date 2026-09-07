import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useProjects } from './context/ProjectContext';
import { LoginScreen } from './screens/LoginScreen';
import { Header } from './components/Header';
import { BottomNav, AppModule } from './components/BottomNav';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProjectsTrackerScreen } from './screens/ProjectsTrackerScreen';
import { ProjectDetailScreen } from './screens/ProjectDetailScreen';
import { FinanceTrackerScreen } from './screens/FinanceTrackerScreen';
import { ProjectGalleryHubScreen } from './screens/ProjectGalleryHubScreen';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { selectedProject, setSelectedProject } = useProjects();
  const [activeModule, setActiveModule] = useState<AppModule>('home');

  // If user is not logged in, show Country Yards login screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleSelectModule = (module: AppModule) => {
    setActiveModule(module);
    if (selectedProject && module !== 'projects') {
      setSelectedProject(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col antialiased selection:bg-yard-mint selection:text-yard-dark">
      {/* Top Mobile Bar with /cy_logo.jpg */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto">
        {/* If viewing a single project detail */}
        {selectedProject ? (
          <ProjectDetailScreen />
        ) : activeModule === 'home' ? (
          /* Main Dashboard: Strictly shows the 3 Cards without details */
          <DashboardScreen onSelectModule={(mod) => setActiveModule(mod)} />
        ) : activeModule === 'projects' ? (
          /* Card 1: Projects Tracker */
          <ProjectsTrackerScreen onBack={() => setActiveModule('home')} />
        ) : activeModule === 'finance' ? (
          /* Card 2: Finance Tracker */
          <FinanceTrackerScreen onBack={() => setActiveModule('home')} />
        ) : (
          /* Card 3: Project Gallery & Media Hub */
          <ProjectGalleryHubScreen
            onBack={() => setActiveModule('home')}
            onGoToProjects={() => setActiveModule('projects')}
          />
        )}
      </main>

      {/* Mobile Navigation Bar */}
      <BottomNav
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
      />
    </div>
  );
};

export default App;
