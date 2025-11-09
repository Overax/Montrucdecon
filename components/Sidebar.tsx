
import React from 'react';
import type { View } from '../types';
import { ICONS } from '../constants';
import { useAppContext } from '../contexts/AppContext';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
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

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { profile } = useAppContext();

  return (
    <div className="w-64 bg-white/60 dark:bg-neutral-900/70 border-r border-neutral-200/80 dark:border-neutral-800/50 flex-shrink-0 flex flex-col hidden md:flex">
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
          <NavItem
            viewName="dashboard"
            label="Dashboard"
            currentView={currentView}
            setView={setView}
            icon={<ICONS.dashboard className="w-5 h-5" />}
          />
          <NavItem
            viewName="clients"
            label="Clients"
            currentView={currentView}
            setView={setView}
            icon={<ICONS.clients className="w-5 h-5" />}
          />
          <NavItem
            viewName="projects"
            label="Projets"
            currentView={currentView}
            setView={setView}
            icon={<ICONS.projects className="w-5 h-5" />}
          />
           <NavItem
            viewName="tasks"
            label="Tâches"
            currentView={currentView}
            setView={setView}
            icon={<ICONS.tasks className="w-5 h-5" />}
          />
           <NavItem
            viewName="calendar"
            label="Calendrier"
            currentView={currentView}
            setView={setView}
            icon={<ICONS.calendar className="w-5 h-5" />}
          />
          <NavItem
            viewName="notes"
            label="Carnet"
            currentView={currentView}
            setView={setView}
            icon={<ICONS.notebook className="w-5 h-5" />}
          />
        </ul>
      </nav>
      <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800/50">
        <ul>
           <NavItem
            viewName="settings"
            label="Paramètres"
            currentView={currentView}
            setView={setView}
            icon={<ICONS.settings className="w-5 h-5" />}
          />
        </ul>
        <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 pt-4">© 2024 Monteur CRM</p>
      </div>
    </div>
  );
};

export default Sidebar;