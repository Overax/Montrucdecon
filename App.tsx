import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Calendar from './components/Calendar';
import Onboarding from './components/Onboarding';
import ClientDetail from './components/ClientDetail';
import Notes from './components/Notes';
import Settings from './components/Settings';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ModalProvider } from './contexts/ModalContext';
import { View, Client } from './types';
import NewItemHubModal from './components/modals/NewItemHubModal';
import NewClientModal from './components/modals/NewClientModal';
import NewProjectModal from './components/modals/NewProjectModal';
import NewTaskModal from './components/modals/NewTaskModal';
import NewVideoModal from './components/modals/NewVideoModal';
import NewEventModal from './components/modals/NewEventModal';
import SaveStatusIndicator from './components/SaveStatusIndicator';

interface ModalState {
    type: 'hub' | 'newClient' | 'newProject' | 'newTask' | 'newVideo' | 'newEvent';
    payload?: any;
}

const AppContent: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalState | null>(null);
    const [recentlyAddedClientId, setRecentlyAddedClientId] = useState<string | null>(null);

    useEffect(() => {
        const hasOnboarded = localStorage.getItem('freelancerOnboarded') === 'true';
        if (!hasOnboarded) {
            setShowOnboarding(true);
        }
    }, []);

    useEffect(() => {
      if (recentlyAddedClientId) {
        const timer = setTimeout(() => setRecentlyAddedClientId(null), 3000); // Highlight for 3 seconds
        return () => clearTimeout(timer);
      }
    }, [recentlyAddedClientId]);

    const handleOnboardingComplete = useCallback(() => {
        localStorage.setItem('freelancerOnboarded', 'true');
        setShowOnboarding(false);
    }, []);

    const handleSelectClient = (clientId: string) => {
        setSelectedClientId(clientId);
        setView('clientDetail');
    };

    const handleBackToClients = () => {
        setSelectedClientId(null);
        setView('clients');
    };

    const openModal = (type: ModalState['type'], payload?: any) => setActiveModal({ type, payload });
    const closeModal = () => setActiveModal(null);

    const handleNewItem = () => {
        switch(view) {
            case 'dashboard': openModal('hub'); break;
            case 'clients': openModal('newClient'); break;
            case 'projects': openModal('newProject'); break;
            case 'tasks': openModal('newTask'); break;
            case 'calendar': openModal('newEvent', { date: new Date().toISOString().split('T')[0]}); break;
            case 'notes': 
                document.dispatchEvent(new CustomEvent('createNewNote'));
                break;
            default: break;
        }
    };

    const handleClientCreated = (newClient: Client) => {
        setRecentlyAddedClientId(newClient.id);
        setView('clients');
        closeModal();
    };

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard setView={setView} />;
            case 'clients':
                return <Clients onSelectClient={handleSelectClient} onNewClient={() => openModal('newClient')} recentlyAddedId={recentlyAddedClientId} />;
            case 'projects':
                return <Projects />;
            case 'tasks':
                return <Tasks />;
            case 'calendar':
                return <Calendar openModal={openModal} />;
            case 'notes':
                return <Notes />;
            case 'settings':
                return <Settings />;
            case 'clientDetail':
                if (selectedClientId) {
                    return <ClientDetail clientId={selectedClientId} onBack={handleBackToClients} openModal={openModal} />;
                }
                return <Clients onSelectClient={handleSelectClient} onNewClient={() => openModal('newClient')} recentlyAddedId={recentlyAddedClientId} />;
            default:
                return <Dashboard setView={setView} />;
        }
    };
    
    const renderModals = () => {
        if (!activeModal) return null;
        switch(activeModal.type) {
            case 'hub':
                return <NewItemHubModal onClose={closeModal} openModal={openModal} />;
            case 'newClient':
                return <NewClientModal onClose={closeModal} onClientCreated={handleClientCreated} />;
            case 'newProject':
                return <NewProjectModal onClose={closeModal} onProjectCreated={closeModal} payload={activeModal.payload} />;
            case 'newTask':
                return <NewTaskModal onClose={closeModal} onTaskCreated={closeModal} />;
            case 'newVideo':
                return <NewVideoModal onClose={closeModal} onVideoAdded={closeModal} payload={activeModal.payload} />;
            case 'newEvent':
                return <NewEventModal onClose={closeModal} onTaskCreated={closeModal} payload={activeModal.payload}/>;
            default:
                return null;
        }
    }
    
    const mainContentClass = view === 'calendar' || view === 'projects' || view === 'notes'
      ? 'flex-1 flex flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-900 p-6 md:p-8'
      : 'flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-neutral-900 p-6 md:p-8';


    return (
        <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-sans">
            {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
            <Sidebar currentView={view} setView={setView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header currentView={view} onNewItem={handleNewItem} />
                <main className={mainContentClass}>
                    {renderView()}
                </main>
            </div>
            {renderModals()}
            <SaveStatusIndicator />
        </div>
    );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
        <AppProvider>
            <ModalProvider>
                <AppContent />
            </ModalProvider>
        </AppProvider>
    </ThemeProvider>
  );
};

export default App;