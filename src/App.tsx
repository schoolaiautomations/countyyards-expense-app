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
import { SiteAssessmentScreen } from './screens/SiteAssessmentScreen';
import { MaintenanceScreen } from './screens/MaintenanceScreen';

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
        ) : activeModule === 'assessment' ? (
          /* Card 3: Client Site Assessment */
          <SiteAssessmentScreen onBack={() => setActiveModule('home')} />
        ) : activeModule === 'maintenance' ? (
          /* Card 4: Inspection / Maintenance */
          <MaintenanceScreen onBack={() => setActiveModule('home')} />
        ) : activeModule === 'projects' ? (
          /* Tab: Projects Tracker */
          <ProjectsTrackerScreen onBack={() => setActiveModule('home')} />
        ) : activeModule === 'finance' ? (
          /* Tab: Finance Tracker */
          <FinanceTrackerScreen onBack={() => setActiveModule('home')} />
        ) : (
          /* Main Dashboard: Shows Cards without details */
          <DashboardScreen onSelectModule={(mod) => setActiveModule(mod)} />
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
