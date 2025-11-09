import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { PROJECT_STATUSES, PROJECT_STATUS_COLORS, ICONS } from '../constants';
import type { Project, ProjectStatus } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import { useModal } from '../contexts/ModalContext';

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const { getClientById, deleteProject } = useAppContext();
    const { showConfirmation } = useModal();
    const client = getClientById(project.clientId);
    const deadline = new Date(project.deadline);
    const today = new Date();
    today.setHours(0,0,0,0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0,0,0,0);
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirmation({
            title: `Supprimer ce projet ?`,
            message: `Le projet "${project.name}" et toutes ses tâches associées seront supprimés définitivement.`,
            onConfirm: () => deleteProject(project.id)
        });
    };

    return (
        <Card className="mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow duration-200 relative group">
            <div className="flex justify-between items-start">
                <h4 className="font-semibold mb-1 text-neutral-800 dark:text-neutral-100 pr-6">{project.name}</h4>
                {client && <Avatar src={client.avatarUrl} name={client.name} className="w-6 h-6 text-xs" />}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{client?.name}</p>
            <div className="flex justify-between items-center text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROJECT_STATUS_COLORS[project.status]}`}>
                    {project.status}
                </span>
                <span className={`font-medium text-xs ${daysLeft < 3 && daysLeft >= 0 ? 'text-red-500' : 'text-neutral-500'}`}>
                    {daysLeft > 0 ? `J-${daysLeft}` : daysLeft === 0 ? `Aujourd'hui` : `Dépassé` }
                </span>
            </div>
            <button 
                onClick={handleDelete}
                className="absolute top-2 right-2 p-1.5 rounded-full text-neutral-400 dark:text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Supprimer le projet"
            >
                <ICONS.trash className="w-4 h-4" />
            </button>
        </Card>
    );
};

const KanbanColumn: React.FC<{
    status: ProjectStatus;
    projects: Project[];
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: ProjectStatus) => void;
    isDraggingOver: boolean;
}> = ({ status, projects, onDragOver, onDrop, isDraggingOver }) => {
    return (
        <div 
            className={`w-full md:w-1/4 bg-neutral-100/60 dark:bg-neutral-900/40 rounded-xl p-3 flex-shrink-0 flex flex-col transition-colors duration-300 ${isDraggingOver ? 'bg-primary-500/10' : ''}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
        >
            <h3 className="font-semibold text-neutral-700 dark:text-neutral-300 px-2 pb-3 mb-2 border-b-2 border-neutral-200 dark:border-neutral-700/80">
                {status} <span className="text-sm font-normal text-neutral-400">{projects.length}</span>
            </h3>
            <div className="flex-1 overflow-y-auto px-1 -mx-1">
                {projects.map(project => (
                    <div 
                        key={project.id}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('projectId', project.id);
                            e.currentTarget.style.opacity = '0.4';
                        }}
                        onDragEnd={(e) => {
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        <ProjectCard project={project} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const Projects: React.FC = () => {
    const { projects, updateProjectStatus } = useAppContext();
    const [draggingOverColumn, setDraggingOverColumn] = useState<ProjectStatus | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: ProjectStatus) => {
        e.preventDefault();
        setDraggingOverColumn(status);
    };
    
    const handleDragLeave = () => {
        setDraggingOverColumn(null);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProjectStatus) => {
        e.preventDefault();
        setDraggingOverColumn(null);
        const projectId = e.dataTransfer.getData('projectId');
        const project = projects.find(p => p.id === projectId);
        if (project && project.status !== newStatus) {
            updateProjectStatus(projectId, newStatus);
        }
    };

    return (
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 h-full" onDragLeave={handleDragLeave}>
            {PROJECT_STATUSES.map(status => (
                <KanbanColumn
                    key={status}
                    status={status as ProjectStatus}
                    projects={projects.filter(p => p.status === status)}
                    onDragOver={(e) => handleDragOver(e, status as ProjectStatus)}
                    onDrop={handleDrop}
                    isDraggingOver={draggingOverColumn === status}
                />
            ))}
        </div>
    );
};

export default Projects;