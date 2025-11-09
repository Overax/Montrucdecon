import React, { useEffect } from 'react';
import type { View } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { ICONS } from '../constants';
import Button from './ui/Button';
import { useAppContext } from '../contexts/AppContext';

interface HeaderProps {
  currentView: View;
  onNewItem: () => void;
}

const viewTitles: { [key in Exclude<View, 'clientDetail'>]: string } & { clientDetail: string } = {
  dashboard: 'Dashboard',
  clients: 'Mes Clients',
  projects: 'Mes Projets',
  tasks: 'Mes Tâches',
  calendar: 'Calendrier',
  notes: "Mon Carnet d'Idées",
  settings: "Paramètres",
  clientDetail: 'Fiche Client'
};

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/60 transition-colors"
            aria-label="Changer de thème"
        >
            {theme === 'light' ? <ICONS.moon className="w-5 h-5" /> : <ICONS.sun className="w-5 h-5" />}
        </button>
    );
};

const UndoRedo: React.FC = () => {
    const { undo, redo, canUndo, canRedo } = useAppContext();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const undoKeyPressed = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'z';
            const redoKeyPressed = (isMac ? e.metaKey : e.ctrlKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'));

            if (undoKeyPressed && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) undo();
            } else if (redoKeyPressed) {
                e.preventDefault();
                if (canRedo) redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, canUndo, canRedo]);

    return (
        <div className="flex items-center space-x-1">
            <button
                onClick={undo}
                disabled={!canUndo}
                className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Annuler (Ctrl+Z)"
            >
                <ICONS.undo className="w-5 h-5" />
            </button>
            <button
                onClick={redo}
                disabled={!canRedo}
                className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200/70 dark:hover:bg-neutral-800/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Rétablir (Ctrl+Y)"
            >
                <ICONS.redo className="w-5 h-5" />
            </button>
        </div>
    );
}


const Header: React.FC<HeaderProps> = ({ currentView, onNewItem }) => {
  const showNewButton = currentView !== 'settings';
  
  return (
    <header className="flex items-center justify-between h-16 px-6 md:px-8 bg-transparent flex-shrink-0">
      <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 capitalize">{viewTitles[currentView]}</h1>
      <div className="flex items-center space-x-2 md:space-x-4">
        {showNewButton && (
          <Button 
            variant="primary" 
            size="sm" 
            leftIcon={<ICONS.plus className="w-4 h-4"/>}
            onClick={onNewItem}
          >
            Nouveau
          </Button>
        )}
        <UndoRedo />
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;