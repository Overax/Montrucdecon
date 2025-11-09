
import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { GoogleGenAI } from "@google/genai";
import { ICONS, PROJECT_TEMPLATES } from '../../constants';
import type { ProjectTemplate } from '../../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface NewProjectModalProps {
  onClose: () => void;
  onProjectCreated: () => void;
  payload?: {
    clientId?: string;
  }
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onProjectCreated, payload }) => {
  const { clients, addProject, addTask } = useAppContext();
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState(payload?.clientId || (clients.length > 0 ? clients[0].id : ''));
  const [estimatedRevenue, setEstimatedRevenue] = useState(500);
  const [deadline, setDeadline] = useState(new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const handleSuggestTasks = async () => {
    if (!name.trim()) return;
    setIsGeneratingTasks(true);
    setSuggestedTasks('');
    const prompt = `Pour un projet de montage vidéo intitulé "${name}", suggère une liste de tâches typiques. Réponds avec une simple liste de points, chaque point commençant par un tiret. Ne mets pas de titre ou d'introduction.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        setSuggestedTasks(response.text);
    } catch (error) {
        console.error("Error suggesting tasks:", error);
        setSuggestedTasks("Désolé, une erreur est survenue lors de la suggestion.");
    } finally {
        setIsGeneratingTasks(false);
    }
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    const clientName = clients.find(c => c.id === clientId)?.name || '';
    let newName = template.defaultName.replace('[Client]', clientName);

    if (template.id === 'template_social') {
        const month = new Date(deadline).toLocaleDateString('fr-FR', { month: 'long' });
        newName = newName.replace('[Mois]', month);
    }

    setName(newName);
    setEstimatedRevenue(template.defaultRevenue);
    const taskText = template.tasks.map(t => `- ${t.text}`).join('\n');
    setSuggestedTasks(taskText);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClientId = e.target.value;
    setClientId(newClientId);
    if (selectedTemplate) {
        const clientName = clients.find(c => c.id === newClientId)?.name || '';
        setName(selectedTemplate.defaultName.replace('[Client]', clientName));
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientId) return;
    const newProject = addProject({
      name,
      clientId,
      estimatedRevenue,
      deadline,
      status: 'À Démarrer'
    });

    if (selectedTemplate) {
        const projectDeadline = new Date(deadline);
        selectedTemplate.tasks.forEach(taskTemplate => {
            const taskDueDate = new Date(projectDeadline);
            // Set time to noon to avoid timezone issues with date-only strings
            taskDueDate.setHours(12, 0, 0, 0);
            taskDueDate.setDate(taskDueDate.getDate() + taskTemplate.dueDayOffset);

            addTask({
                text: taskTemplate.text,
                projectId: newProject.id,
                clientId: newProject.clientId,
                priority: taskTemplate.priority,
                dueDate: taskDueDate.toISOString().split('T')[0],
            });
        });
    }

    onProjectCreated();
  };

  return (
    <ModalWrapper title="Nouveau Projet" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-300">Commencer avec un modèle ?</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PROJECT_TEMPLATES.map(template => {
              const Icon = ICONS[template.icon];
              const isSelected = selectedTemplate?.id === template.id;
              return (
                <button
                  type="button"
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 text-left border rounded-lg transition-all ${isSelected ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500' : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-500/5'}`}
                >
                    <Icon className="w-6 h-6 mb-2 text-primary-600 dark:text-primary-400"/>
                    <h4 className="font-semibold text-sm">{template.name}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{template.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
           <label className="block text-sm font-medium my-2 text-neutral-600 dark:text-neutral-300">Détails du projet</label>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Client *</label>
          <select 
            value={clientId} 
            onChange={handleClientChange} 
            required 
            disabled={!!payload?.clientId}
            className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-200 dark:disabled:bg-neutral-700/50"
          >
            <option value="" disabled>Sélectionner un client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Nom du projet *</label>
          <div className="flex items-center space-x-2">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Vidéo publicitaire V3" required className="flex-1 w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
            {!selectedTemplate && (
                <Button type="button" variant="ghost" size="sm" onClick={handleSuggestTasks} disabled={isGeneratingTasks || !name.trim()} className="!p-2" aria-label="Suggérer des tâches">
                    <ICONS.sparkles className={`w-5 h-5 ${isGeneratingTasks ? 'animate-pulse' : ''}`}/>
                </Button>
            )}
          </div>
        </div>

        {suggestedTasks && (
            <div className="pt-2">
                <label className="block text-xs font-medium mb-1 text-neutral-500 dark:text-neutral-400">Tâches pré-remplies / suggérées</label>
                <textarea
                    readOnly
                    value={suggestedTasks}
                    className="w-full h-24 p-2 text-sm bg-neutral-100 dark:bg-neutral-700/50 border border-neutral-300 dark:border-neutral-600 rounded-lg"
                />
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Revenu Estimé (€)</label>
              <input type="number" value={estimatedRevenue} onChange={e => setEstimatedRevenue(Number(e.target.value))} required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Échéance</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
            </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit">Créer le projet</Button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default NewProjectModal;