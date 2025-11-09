
import React from 'react';
import ModalWrapper from './ModalWrapper';
import { ICONS } from '../../constants';
import type { ModalType } from '../../types';

interface NewItemHubModalProps {
  onClose: () => void;
  openModal: (modal: ModalType) => void;
}

const HubButton: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; }> = ({ label, icon, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 space-y-2 w-full bg-neutral-100 dark:bg-neutral-700/50 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
    >
        {icon}
        <span className="font-semibold">{label}</span>
    </button>
);

const NewItemHubModal: React.FC<NewItemHubModalProps> = ({ onClose, openModal }) => {
  return (
    <ModalWrapper title="Créer un nouvel élément" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HubButton 
            label="Client" 
            icon={<ICONS.userAdd className="w-8 h-8"/>} 
            onClick={() => { onClose(); openModal('newClient'); }}
        />
        <HubButton 
            label="Projet" 
            icon={<ICONS.folderAdd className="w-8 h-8"/>}
            onClick={() => { onClose(); openModal('newProject'); }}
        />
        <HubButton 
            label="Tâche" 
            icon={<ICONS.checkCircle className="w-8 h-8"/>}
            onClick={() => { onClose(); openModal('newTask'); }}
        />
      </div>
    </ModalWrapper>
  );
};

export default NewItemHubModal;
