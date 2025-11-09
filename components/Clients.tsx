import React from 'react';
import Card from './ui/Card';
import { useAppContext } from '../contexts/AppContext';
import { ICONS } from '../constants';
import Avatar from './ui/Avatar';
import { useModal } from '../contexts/ModalContext';

interface ClientsProps {
    onSelectClient: (clientId: string) => void;
    onNewClient: () => void;
    recentlyAddedId: string | null;
}

const Clients: React.FC<ClientsProps> = ({ onSelectClient, onNewClient, recentlyAddedId }) => {
    const { clients, getProjectsByClientId, deleteClient } = useAppContext();
    const { showConfirmation } = useModal();

    const handleDelete = (e: React.MouseEvent, clientId: string, clientName: string) => {
        e.stopPropagation();
        showConfirmation({
            title: `Supprimer ${clientName} ?`,
            message: "Cette action est irréversible. Toutes les données associées (projets, tâches, documents) seront définitivement perdues.",
            onConfirm: () => deleteClient(clientId),
            confirmText: 'Oui, supprimer le client'
        });
    };

    const clientCards = clients.map(client => {
        const clientProjects = getProjectsByClientId(client.id);
        const activeProjects = clientProjects.filter(p => p.status !== 'Terminé').length;
        const isNew = client.id === recentlyAddedId;

        return (
            <Card 
                key={client.id} 
                className={`flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95 group relative ${isNew ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-neutral-950' : ''}`}
            >
                <div onClick={() => onSelectClient(client.id)} className="w-full flex-1 flex flex-col items-center cursor-pointer">
                    <Avatar src={client.avatarUrl} name={client.name} className="w-20 h-20 mb-4 border-4 border-white dark:border-neutral-800 shadow-md" />
                    <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100">{client.name}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">{client.company}</p>
                    
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4 px-2" style={{ minHeight: '44px' }}>
                        {client.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-neutral-200 dark:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300">
                                {tag}
                            </span>
                        ))}
                        {client.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-neutral-200 dark:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300">
                                +{client.tags.length - 3}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700 w-full flex justify-around">
                        <div className="text-center">
                            <p className="font-bold text-xl text-neutral-700 dark:text-neutral-200">{clientProjects.length}</p>
                            <p className="text-xs text-neutral-500">Projets</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-xl text-primary-600 dark:text-primary-400">{activeProjects}</p>
                            <p className="text-xs text-neutral-500">Actifs</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={(e) => handleDelete(e, client.id, client.name)} 
                    className="absolute top-2 right-2 p-1.5 rounded-full text-neutral-400 dark:text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Supprimer le client"
                >
                    <ICONS.trash className="w-4 h-4" />
                </button>
            </Card>
        )
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clientCards}
             <div 
                className="flex flex-col items-center justify-center text-center border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-6 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:border-primary-500 transition-all duration-300 cursor-pointer text-neutral-500"
                onClick={onNewClient}
                role="button"
                aria-label="Ajouter un nouveau client"
            >
                <ICONS.plus className="w-10 h-10 mb-2" />
                <h3 className="font-bold text-lg">Nouveau Client</h3>
            </div>
        </div>
    );
};

export default Clients;