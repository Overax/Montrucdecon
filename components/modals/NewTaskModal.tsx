
import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import type { TaskPriority } from '../../types';

interface NewTaskModalProps {
  onClose: () => void;
  onTaskCreated: () => void;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ onClose, onTaskCreated }) => {
  const { projects, clients, addTask } = useAppContext();
  const [text, setText] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Moyenne');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const project = projects.find(p => p.id === projectId);
    addTask({
      text,
      projectId: projectId || undefined,
      clientId: project?.clientId,
      priority,
      dueDate
    });
    onTaskCreated();
  };

  return (
    <ModalWrapper title="Nouvelle Tâche" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Tâche *</label>
          <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Ex: Exporter la V1 pour le client..." required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Projet (optionnel)</label>
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500">
            <option value="">Aucun projet</option>
            {projects.filter(p => p.status !== 'Terminé').map(p => {
              const client = clients.find(c => c.id === p.clientId);
              return <option key={p.id} value={p.id}>{p.name} ({client?.name})</option>
            })}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Priorité</label>
            <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500">
              <option value="Basse">Basse</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Haute">Haute</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Échéance</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit">Créer la tâche</Button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default NewTaskModal;
