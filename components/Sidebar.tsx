import React from 'react';
import type { View } from '../types';
import { ICONS } from '../constants';
import { useAppContext } from '../contexts/AppContext';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean; // for mobile
  setIsOpen: (isOpen: boolean) => void; // for mobile
}

const NavItem: React.FC<{
  viewName: View;
  label: string;
  currentView: View;
  setView: (view: View) => void;
  icon: React.ReactNode;
}> = ({ viewName, label, currentView, setView, icon }) => {
  const isActive = currentView === viewName;
  return (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setView(viewName);
        }}
        className={`flex items-center p-2 mx-3 my-1 rounded-md transition-colors duration-200 ${
          isActive
            ? 'bg-primary-500/10 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300'
            : 'text-neutral-500 hover:bg-neutral-500/5 dark:hover:bg-neutral-800/60'
        }`}
      >
        {icon}
        <span className="ml-3 font-medium">{label}</span>
      </a>
    </li>
  );
};

const SidebarContent: React.FC<{ currentView: View; setView: (view: View) => void; }> = ({ currentView, setView }) => {
    const { profile } = useAppContext();
    return (
        <>
            <div className="flex items-center h-16 px-4 border-b border-neutral-200/80 dark:border-neutral-800/50">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'F'}
                </div>
                <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 truncate">{profile.name || 'Freelance'}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{profile.title || 'Monteur Vidéo'}</p>
                </div>
            </div>
            <nav className="flex-1 pt-4">
                <ul>
                <NavItem viewName="dashboard" label="Dashboard" currentView={currentView} setView={setView} icon={<ICONS.dashboard className="w-5 h-5" />} />
                <NavItem viewName="clients" label="Clients" currentView={currentView} setView={setView} icon={<ICONS.clients className="w-5 h-5" />} />
                <NavItem viewName="projects" label="Projets" currentView={currentView} setView={setView} icon={<ICONS.projects className="w-5 h-5" />} />
                <NavItem viewName="tasks" label="Tâches" currentView={currentView} setView={setView} icon={<ICONS.tasks className="w-5 h-5" />} />
                <NavItem viewName="calendar" label="Calendrier" currentView={currentView} setView={setView} icon={<ICONS.calendar className="w-5 h-5" />} />
                <NavItem viewName="notes" label="Carnet" currentView={currentView} setView={setView} icon={<ICONS.notebook className="w-5 h-5" />} />
                <NavItem viewName="portfolio" label="Portfolio" currentView={currentView} setView={setView} icon={<ICONS.collection className="w-5 h-5" />} />
                </ul>
            </nav>
            <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800/50">
                <ul>
                <NavItem viewName="settings" label="Paramètres" currentView={currentView} setView={setView} icon={<ICONS.settings className="w-5 h-5" />} />
                </ul>
                <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 pt-4">© 2024 Monteur CRM</p>
            </div>
        </>
    )
};


const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen }) => {
  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-30 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)}></div>
          <div className={`relative flex w-64 max-w-[calc(100%-3rem)] flex-col bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <button 
                  onClick={() => setIsOpen(false)} 
                  className="absolute top-4 right-4 p-2 rounded-full text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 z-50"
                  aria-label="Fermer le menu"
              >
                  <ICONS.close className="w-6 h-6"/>
              </button>
              <SidebarContent currentView={currentView} setView={setView} />
          </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="w-64 bg-white/60 dark:bg-neutral-900/70 border-r border-neutral-200/80 dark:border-neutral-800/50 flex-shrink-0 flex flex-col hidden md:flex">
          <SidebarContent currentView={currentView} setView={setView} />
      </div>
    </>
  );
};

export default Sidebar;
