import React, { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect, useMemo } from 'react';
import type { Client, Project, Task, Note, FreelancerProfile, ProjectStatus, DocumentFile, NoteLink } from '../types';
import { NOTE_COLORS } from '../constants';

// --- Combined App State ---
interface AppState {
    profile: FreelancerProfile;
    clients: Client[];
    projects: Project[];
    tasks: Task[];
    notes: Note[];
    noteLinks: NoteLink[];
    documents: DocumentFile[];
}

interface AppContextType extends AppState {
    updateProfile: (updates: Partial<FreelancerProfile>) => void;
    addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
    updateClient: (clientId: string, updates: Partial<Client>) => void;
    deleteClient: (clientId: string) => void;
    addProject: (project: Omit<Project, 'id'>) => Project;
    updateProject: (projectId: string, updates: Partial<Project>) => void;
    deleteProject: (projectId: string) => void;
    updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'completed'>) => Task;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
    notes: Note[];
    addNote: (note: Partial<Omit<Note, 'id' | 'createdAt'>>) => Note;
    updateNote: (noteId: string, updates: Partial<Note>) => void;
    deleteNote: (noteId: string) => void;
    noteLinks: NoteLink[];
    addNoteLink: (from: string, to: string) => void;
    deleteNoteLink: (linkId: string) => void;
    deleteLinksForNote: (noteId: string) => void;
    stats: {
        clientCount: number;
        activeProjects: number;
        estimatedRevenue: number;
    };
    getClientById: (id: string) => Client | undefined;
    getProjectsByClientId: (id: string) => Project[];
    documents: DocumentFile[];
    addDocument: (doc: Omit<DocumentFile, 'id' | 'uploadedAt'>) => void;
    addVideo: (video: Omit<DocumentFile, 'id' | 'uploadedAt' | 'type'>) => void;
    getDocumentsByClientId: (id: string) => DocumentFile[];
    getNotesByClientId: (id: string) => Note[];
    saveStatus: string;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

// --- DUMMY DATA ---
const DUMMY_APP_STATE: AppState = {
    profile: { name: 'Alex Luna', title: 'Monteur Vidéo Créatif', email: 'alex.luna@example.com', phone: '0612345678', avatarUrl: '' },
    clients: [
        { id: 'client_1', name: 'Studio Anima', company: 'Anima Productions', email: 'contact@anima.studio', phone: '0123456789', tags: ['Animation', 'Corporate'], createdAt: new Date().toISOString() },
        { id: 'client_2', name: 'Sophie Durand', company: 'Influence & Co', email: 'sophie.d@influence.co', phone: '0987654321', tags: ['Réseaux Sociaux'], createdAt: new Date().toISOString() },
    ],
    projects: [
        { id: 'proj_1', clientId: 'client_1', name: 'Vidéo publicitaire V2', status: 'En Cours', deadline: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), estimatedRevenue: 2500 },
        { id: 'proj_2', clientId: 'client_2', name: 'Reels Instagram - Mai', status: 'À Démarrer', deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), estimatedRevenue: 800 },
        { id: 'proj_3', clientId: 'client_1', name: 'Film institutionnel', status: 'En Révision', deadline: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(), estimatedRevenue: 4000 },
        { id: 'proj_4', clientId: 'client_2', name: 'Montage VLOG YouTube', status: 'Terminé', deadline: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(), estimatedRevenue: 650 },
    ],
    documents: [
        { id: 'doc_1', clientId: 'client_1', name: 'Brief_Animation.pdf', type: 'pdf', uploadedAt: new Date().toISOString() },
        { id: 'doc_2', clientId: 'client_1', name: 'Logo_Anima.png', type: 'image', uploadedAt: new Date().toISOString() },
        { id: 'doc_3', clientId: 'client_1', name: 'Pub_Anima_V1.mp4', type: 'video', url: '#', thumbnailUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=300&fit=crop', uploadedAt: new Date().toISOString() },
        { id: 'doc_4', clientId: 'client_2', name: 'Reel_Mai_1.mp4', type: 'video', url: '#', thumbnailUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop', uploadedAt: new Date().toISOString() },
    ],
    tasks: [
        { id: 'task_1', text: 'Exporter la première version pour Anima', completed: false, dueDate: new Date().toISOString(), priority: 'Haute', projectId: 'proj_1', clientId: 'client_1'},
        { id: 'task_2', text: 'Préparer les rushes pour les reels', completed: false, dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), priority: 'Moyenne', projectId: 'proj_2', clientId: 'client_2'},
        { id: 'task_3', text: 'Rechercher des musiques pour VLOG', completed: true, dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), priority: 'Basse', projectId: 'proj_4', clientId: 'client_2'},
    ],
    notes: [
        { id: 'note_1', clientId: 'client_1', content: 'Le client insiste sur une colorimétrie très vive, style "pop". Penser à utiliser la LUT "CyberGlow".', createdAt: new Date().toISOString(), x:0, y:0, width: 192, height: 192, color:'', rotation: 0 },
        { id: 'note_2', clientId: 'client_1', content: 'Ne pas oublier d\'intégrer le nouveau logo à la fin de la vidéo.', createdAt: new Date().toISOString(), x:0, y:0, width: 192, height: 192, color:'', rotation: 0 },
        { id: 'note_board_1', content: 'Idée de Reel : Tuto 30s sur un effet de transition populaire', createdAt: new Date().toISOString(), x: 100, y: 150, width: 192, height: 192, color: 'bg-yellow-100 dark:bg-yellow-800/60 border-yellow-200 dark:border-yellow-700/80 text-neutral-800 dark:text-neutral-200', rotation: -2 },
        { id: 'note_board_2', content: 'Brainstorming pour le projet "Studio Anima". Thèmes : futuriste, clean, dynamique.', createdAt: new Date().toISOString(), x: 400, y: 80, width: 192, height: 192, color: 'bg-blue-100 dark:bg-blue-800/60 border-blue-200 dark:border-blue-700/80 text-neutral-800 dark:text-neutral-200', rotation: 1 },
        { id: 'note_board_3', content: 'Penser à mettre à jour mon portfolio avec le dernier film institutionnel.', createdAt: new Date().toISOString(), x: 250, y: 300, width: 192, height: 192, color: 'bg-pink-100 dark:bg-pink-800/60 border-pink-200 dark:border-pink-700/80 text-neutral-800 dark:text-neutral-200', rotation: 3 },
    ],
    noteLinks: [
      { id: 'link_1', from: 'note_board_1', to: 'note_board_2' },
    ]
};

const EMPTY_APP_STATE: AppState = {
    profile: { name: '', title: '' },
    clients: [],
    projects: [],
    tasks: [],
    notes: [],
    noteLinks: [],
    documents: [],
}
// --- END DUMMY DATA ---

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [saveStatus, setSaveStatus] = useState('');
    const saveTimeoutRef = useRef<number | null>(null);

    // --- Undo/Redo State Management ---
    const [history, setHistory] = useState<AppState[]>(() => {
        try {
            const item = window.localStorage.getItem('appStateHistory');
            if (item) return JSON.parse(item);
        } catch (error) { console.error("Error reading history from localStorage", error); }

        const hasOnboarded = window.localStorage.getItem('freelancerOnboarded') === 'true';
        return [hasOnboarded ? EMPTY_APP_STATE : DUMMY_APP_STATE];
    });

    const [currentIndex, setCurrentIndex] = useState(() => {
        try {
            const item = window.localStorage.getItem('appStateCurrentIndex');
            if (item) return JSON.parse(item);
        } catch (error) { console.error("Error reading index from localStorage", error); }
        return 0;
    });

    const appState = history[currentIndex];

    useEffect(() => {
        try {
            window.localStorage.setItem('appStateHistory', JSON.stringify(history));
            window.localStorage.setItem('appStateCurrentIndex', JSON.stringify(currentIndex));
        } catch (error) {
            console.error("Error saving state to localStorage", error);
        }
    }, [history, currentIndex]);
    
    const setAppState = useCallback((updater: (prevState: AppState) => AppState) => {
        const newState = updater(history[currentIndex]);
        
        if (JSON.stringify(newState) === JSON.stringify(history[currentIndex])) {
            return;
        }

        const newHistory = history.slice(0, currentIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
    }, [history, currentIndex]);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const triggerSaveNotification = useCallback((message: string = 'Sauvegardé ✓') => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        let statusMessage = message;
        if (message === 'Sauvegardé ✓') {
            setSaveStatus('Sauvegarde...');
        } else {
            setSaveStatus(message); // For undo/redo immediate feedback
        }

        saveTimeoutRef.current = window.setTimeout(() => {
            setSaveStatus(message);
            saveTimeoutRef.current = window.setTimeout(() => setSaveStatus(''), 2000);
        }, 300);
    }, []);

    const undo = useCallback(() => {
        if (canUndo) {
            setCurrentIndex(i => i - 1);
            triggerSaveNotification('Action annulée');
        }
    }, [canUndo, triggerSaveNotification]);

    const redo = useCallback(() => {
        if (canRedo) {
            setCurrentIndex(i => i + 1);
            triggerSaveNotification('Action rétablie');
        }
    }, [canRedo, triggerSaveNotification]);
    
    // --- Profile Management ---
    const updateProfile = (updates: Partial<FreelancerProfile>) => {
        setAppState(prev => ({ ...prev, profile: { ...prev.profile, ...updates } }));
        triggerSaveNotification();
    };

    // --- Client Management ---
    const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
        const newClient: Client = { ...clientData, id: generateId(), createdAt: new Date().toISOString() };
        setAppState(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
        triggerSaveNotification();
        return newClient;
    };
    
    const updateClient = (clientId: string, updates: Partial<Client>) => {
        setAppState(prev => ({ ...prev, clients: prev.clients.map(c => c.id === clientId ? { ...c, ...updates } : c) }));
        triggerSaveNotification();
    };

    const deleteClient = (clientId: string) => {
        setAppState(prev => {
            const clientProjects = prev.projects.filter(p => p.clientId === clientId).map(p => p.id);
            return {
                ...prev,
                tasks: prev.tasks.filter(t => !clientProjects.includes(t.projectId ?? '') && t.clientId !== clientId),
                projects: prev.projects.filter(p => p.clientId !== clientId),
                documents: prev.documents.filter(d => d.clientId !== clientId),
                notes: prev.notes.filter(n => n.clientId !== clientId),
                clients: prev.clients.filter(c => c.id !== clientId)
            };
        });
        triggerSaveNotification();
    };

    // --- Project Management ---
    const addProject = (projectData: Omit<Project, 'id'>): Project => {
        const newProject: Project = { ...projectData, id: generateId() };
        setAppState(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
        triggerSaveNotification();
        return newProject;
    };
    
    const updateProject = (projectId: string, updates: Partial<Project>) => {
        setAppState(prev => ({ ...prev, projects: prev.projects.map(p => p.id === projectId ? { ...p, ...updates } : p) }));
        triggerSaveNotification();
    };

    const deleteProject = (projectId: string) => {
        setAppState(prev => ({
            ...prev,
            projects: prev.projects.filter(p => p.id !== projectId),
            tasks: prev.tasks.filter(t => t.projectId !== projectId)
        }));
        triggerSaveNotification();
    };

    const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
      setAppState(prev => ({...prev, projects: prev.projects.map(p => p.id === projectId ? { ...p, status } : p) }));
      triggerSaveNotification();
    };
    
    // --- Task Management ---
    const addTask = (taskData: Omit<Task, 'id'|'completed'>): Task => {
        const newTask: Task = { ...taskData, id: generateId(), completed: false };
        setAppState(prev => ({...prev, tasks: [...prev.tasks, newTask].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())}));
        triggerSaveNotification();
        return newTask;
    };

    const updateTask = (taskId: string, updates: Partial<Task>) => {
        setAppState(prev => ({...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }));
        triggerSaveNotification();
    };

    const deleteTask = (taskId: string) => {
        setAppState(prev => ({...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
        triggerSaveNotification();
    };

    // --- Note Management ---
    const addNote = (noteData: Partial<Omit<Note, 'id'|'createdAt'>>): Note => {
        const newNote: Note = { 
            content: 'Nouvelle note...', x: 50, y: 50, width: 192, height: 192,
            color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
            rotation: Math.random() * 4 - 2, ...noteData,
            id: generateId(), createdAt: new Date().toISOString(),
        };
        setAppState(prev => ({...prev, notes: [...prev.notes, newNote]}));
        triggerSaveNotification();
        return newNote;
    };

    const updateNote = (noteId: string, updates: Partial<Note>) => {
        setAppState(prev => ({...prev, notes: prev.notes.map(n => n.id === noteId ? { ...n, ...updates } : n)}));
        triggerSaveNotification();
    };

    const deleteNote = (noteId: string) => {
        setAppState(prev => ({...prev, notes: prev.notes.filter(n => n.id !== noteId)}));
        triggerSaveNotification();
    };

    // --- Note Link Management ---
    const addNoteLink = (from: string, to: string) => {
      if (from === to) return;
      setAppState(prev => {
          const exists = prev.noteLinks.some(l => (l.from === from && l.to === to) || (l.from === to && l.to === from));
          if (exists) return prev;
          const newLink: NoteLink = { id: generateId(), from, to };
          triggerSaveNotification();
          return {...prev, noteLinks: [...prev.noteLinks, newLink]};
      });
    };

    const deleteNoteLink = (linkId: string) => {
        setAppState(prev => ({...prev, noteLinks: prev.noteLinks.filter(l => l.id !== linkId)}));
        triggerSaveNotification();
    };
    
    const deleteLinksForNote = (noteId: string) => {
        setAppState(prev => ({...prev, noteLinks: prev.noteLinks.filter(l => l.from !== noteId && l.to !== noteId)}));
        triggerSaveNotification();
    };

    // --- Document Management ---
    const addDocument = (docData: Omit<DocumentFile, 'id' | 'uploadedAt'>) => {
        const newDocument: DocumentFile = { ...docData, id: generateId(), uploadedAt: new Date().toISOString() };
        setAppState(prev => ({...prev, documents: [...prev.documents, newDocument]}));
        triggerSaveNotification();
    }
    
     const addVideo = (videoData: Omit<DocumentFile, 'id' | 'uploadedAt' | 'type'>) => {
        const newVideo: DocumentFile = { ...videoData, id: generateId(), uploadedAt: new Date().toISOString(), type: 'video' };
        setAppState(prev => ({...prev, documents: [...prev.documents, newVideo]}));
        triggerSaveNotification();
    }

    // --- Stats & Getters (memoized for performance) ---
    const stats = useMemo(() => ({
        clientCount: appState.clients.length,
        activeProjects: appState.projects.filter(p => p.status === 'En Cours' || p.status === 'En Révision').length,
        estimatedRevenue: appState.projects.reduce((acc, p) => acc + p.estimatedRevenue, 0),
    }), [appState.clients, appState.projects]);

    const getClientById = useCallback((id: string) => appState.clients.find(c => c.id === id), [appState.clients]);
    const getProjectsByClientId = useCallback((id: string) => appState.projects.filter(p => p.clientId === id), [appState.projects]);
    const getDocumentsByClientId = useCallback((id: string) => appState.documents.filter(doc => doc.clientId === id), [appState.documents]);
    const getNotesByClientId = useCallback((id: string) => appState.notes.filter(n => n.clientId === id), [appState.notes]);

    return (
        <AppContext.Provider value={{ 
            ...appState,
            updateProfile, 
            addClient, updateClient, deleteClient,
            addProject, updateProject, deleteProject, updateProjectStatus, 
            addTask, updateTask, deleteTask,
            addNote, updateNote, deleteNote, getNotesByClientId,
            addNoteLink, deleteNoteLink, deleteLinksForNote,
            stats, getClientById, getProjectsByClientId, 
            addDocument, addVideo, getDocumentsByClientId,
            saveStatus,
            undo, redo, canUndo, canRedo
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};