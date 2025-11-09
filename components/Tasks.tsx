import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { TASK_PRIORITY_COLORS, ICONS } from '../constants';
import type { Task, TaskPriority } from '../types';
import { useModal } from '../contexts/ModalContext';

const PriorityChanger: React.FC<{ task: Task }> = ({ task }) => {
    const { updateTask } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePriorityChange = (newPriority: TaskPriority) => {
        updateTask(task.id, { priority: newPriority });
        setIsMenuOpen(false);
    };
    
    const priorities: TaskPriority[] = ['Haute', 'Moyenne', 'Basse'];

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                title={`Priorité: ${task.priority}. Cliquer pour changer.`}
            >
                <div className={`w-2.5 h-2.5 rounded-full ${TASK_PRIORITY_COLORS[task.priority]}`} />
            </button>

            {isMenuOpen && (
                <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 p-1">
                    <p className="px-2 pt-1 pb-1.5 text-xs font-semibold text-neutral-400 border-b border-neutral-200 dark:border-neutral-700 mb-1">
                        Définir la priorité
                    </p>
                    {priorities.map(p => (
                        <button
                            key={p}
                            onClick={() => handlePriorityChange(p)}
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md flex items-center"
                        >
                            <div className={`w-2.5 h-2.5 rounded-full mr-2.5 ${TASK_PRIORITY_COLORS[p]}`} />
                            <span className="flex-1 text-neutral-700 dark:text-neutral-200">{p}</span>
                            {task.priority === p && <ICONS.checkCircle className="w-4 h-4 text-primary-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const { updateTask, projects, clients, deleteTask } = useAppContext();
    const { showConfirmation } = useModal();
    const project = projects.find(p => p.id === task.projectId);
    const client = clients.find(c => c.id === task.clientId);

    const handleToggle = () => {
        updateTask(task.id, { completed: !task.completed });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirmation({
            title: 'Supprimer la tâche ?',
            message: `Voulez-vous vraiment supprimer la tâche : "${task.text}" ?`,
            onConfirm: () => deleteTask(task.id)
        });
    };

    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    const isOverdue = dueDate < today && !task.completed;

    return (
        <div className={`flex items-center p-3 rounded-lg transition-colors group ${task.completed ? 'bg-neutral-100 dark:bg-neutral-800/50' : 'bg-white dark:bg-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}>
            <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={handleToggle}
                className="w-5 h-5 rounded-md text-primary-600 bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 focus:ring-primary-500 cursor-pointer flex-shrink-0"
            />
            <div className="ml-3 flex-1">
                <p className={`font-medium ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-100'}`}>{task.text}</p>
                <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 space-x-2 mt-1">
                    {project && <span>{project.name}</span>}
                    {client && !project && <span>{client.name}</span>}
                    <PriorityChanger task={task} />
                </div>
            </div>
            <div className={`text-sm font-semibold ml-4 ${isOverdue ? 'text-red-500' : 'text-neutral-500'}`}>
                {dueDate.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
            </div>
            <button onClick={handleDelete} className="ml-2 p-2 rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Supprimer la tâche">
                <ICONS.trash className="w-4 h-4" />
            </button>
        </div>
    );
};


const Tasks: React.FC = () => {
    const { tasks, projects, clients } = useAppContext();
    
    const [selectedProjectId, setSelectedProjectId] = useState('all');
    const [selectedClientId, setSelectedClientId] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');

    useEffect(() => {
        if (selectedProjectId !== 'all') {
            const project = projects.find(p => p.id === selectedProjectId);
            if (project?.clientId !== selectedClientId && selectedClientId !== 'all') {
                setSelectedProjectId('all');
            }
        }
    }, [selectedClientId, selectedProjectId, projects]);

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(task => {
                const isPriorityMatch = selectedPriority === 'all' || task.priority === selectedPriority;
                const isProjectMatch = selectedProjectId === 'all' || task.projectId === selectedProjectId;
                
                let isClientMatch = selectedClientId === 'all';
                if (!isClientMatch) {
                    const project = projects.find(p => p.id === task.projectId);
                    isClientMatch = task.clientId === selectedClientId || project?.clientId === selectedClientId;
                }

                return isPriorityMatch && isProjectMatch && isClientMatch;
            })
            .sort((a,b) => (a.completed ? 1 : -1) || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [tasks, selectedPriority, selectedProjectId, selectedClientId, projects]);

    const handleClearFilters = () => {
        setSelectedProjectId('all');
        setSelectedClientId('all');
        setSelectedPriority('all');
    };

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(startOfToday.getDate() + 7);

    const overdueTasks = filteredTasks.filter(t => new Date(t.dueDate) < startOfToday && !t.completed);
    const todayTasks = filteredTasks.filter(t => new Date(t.dueDate) >= startOfToday && new Date(t.dueDate) <= today && !t.completed);
    const weekTasks = filteredTasks.filter(t => new Date(t.dueDate) > today && new Date(t.dueDate) <= endOfWeek && !t.completed);
    const upcomingTasks = filteredTasks.filter(t => new Date(t.dueDate) > endOfWeek && !t.completed);
    const completedTasks = filteredTasks.filter(t => t.completed);

    const taskGroups = [
        { title: 'En retard', tasks: overdueTasks },
        { title: 'Aujourd\'hui', tasks: todayTasks },
        { title: 'Cette semaine', tasks: weekTasks },
        { title: 'À venir', tasks: upcomingTasks },
        { title: 'Terminées', tasks: completedTasks },
    ].filter(group => group.tasks.length > 0);
    
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4 p-4 bg-white/70 dark:bg-neutral-900/50 rounded-lg shadow-sm border border-neutral-200/80 dark:border-neutral-800/60">
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="client-filter" className="block text-xs font-medium text-neutral-500 mb-1">Client</label>
                    <select
                        id="client-filter"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                        <option value="all">Tous les clients</option>
                        {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                    </select>
                </div>
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="project-filter" className="block text-xs font-medium text-neutral-500 mb-1">Projet</label>
                    <select
                        id="project-filter"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                        <option value="all">Tous les projets</option>
                        {projects
                            .filter(p => p.status !== 'Terminé' && (selectedClientId === 'all' || p.clientId === selectedClientId))
                            .map(project => <option key={project.id} value={project.id}>{project.name}</option>)
                        }
                    </select>
                </div>
                <div className="flex-grow min-w-[150px]">
                    <label htmlFor="priority-filter" className="block text-xs font-medium text-neutral-500 mb-1">Priorité</label>
                    <select
                        id="priority-filter"
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
                        className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                        <option value="all">Toutes les priorités</option>
                        <option value="Haute">Haute</option>
                        <option value="Moyenne">Moyenne</option>
                        <option value="Basse">Basse</option>
                    </select>
                </div>
                <button
                    onClick={handleClearFilters}
                    className="h-10 px-4 py-2 text-sm font-semibold bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-lg transition-colors flex-shrink-0"
                >
                    Effacer
                </button>
            </div>
            {tasks.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold mb-2">Aucune tâche pour le moment.</h2>
                    <p className="text-neutral-500">Cliquez sur "Nouveau" pour créer votre première tâche !</p>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold mb-2">Aucune tâche ne correspond à vos filtres.</h2>
                    <p className="text-neutral-500">Essayez de modifier ou d'effacer vos filtres.</p>
                </div>
            ) : (
                taskGroups.map(group => (
                     <div key={group.title}>
                        <h2 className="text-lg font-semibold mb-3 text-neutral-700 dark:text-neutral-200">{group.title} ({group.tasks.length})</h2>
                        <div className="space-y-2">
                            {group.tasks.map(task => <TaskItem key={task.id} task={task} />)}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

export default Tasks;