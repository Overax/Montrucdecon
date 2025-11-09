import React, { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import type { Client, Project, Task, Note, FreelancerProfile, ProjectStatus, DocumentFile, NoteLink, PortfolioVideo } from '../types';
import { NOTE_COLORS } from '../constants';
import { getFunctions, httpsCallable } from 'firebase/functions';

// --- Combined App State ---
interface AppState {
    profile: FreelancerProfile | null;
    clients: Client[];
    projects: Project[];
    tasks: Task[];
    notes: Note[];
    noteLinks: NoteLink[];
    documents: DocumentFile[];
    portfolioVideos: PortfolioVideo[];
    youtubePlaylistUrl: string;
}

interface AppContextType extends AppState {
    updateProfile: (updates: Partial<FreelancerProfile>) => Promise<void>;
    addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
    updateClient: (clientId: string, updates: Partial<Client>) => Promise<void>;
    deleteClient: (clientId: string) => Promise<void>;
    addProject: (project: Omit<Project, 'id'>) => Promise<Project>;
    updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    updateProjectStatus: (projectId: string, status: ProjectStatus) => Promise<void>;
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<Task>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    notes: Note[];
    addNote: (note: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<Note>;
    updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (noteId: string) => Promise<void>;
    noteLinks: NoteLink[];
    addNoteLink: (from: string, to: string) => Promise<void>;
    deleteNoteLink: (linkId: string) => Promise<void>;
    deleteLinksForNote: (noteId: string) => Promise<void>;
    addPortfolioVideo: (video: Omit<PortfolioVideo, 'id' | 'createdAt' | 'isPinned'>) => Promise<PortfolioVideo>;
    updatePortfolioVideo: (videoId: string, updates: Partial<PortfolioVideo>) => Promise<void>;
    deletePortfolioVideo: (videoId: string) => Promise<void>;
    setYoutubePlaylistUrl: (url: string) => void;
    syncPlaylist: () => Promise<void>;
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
    triggerNotification: (message: string, isSave?: boolean) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const sanitizeData = <T extends object>(data: T): T => {
    return Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            (acc as any)[key] = value;
        }
        return acc;
    }, {} as T);
};

const EMPTY_APP_STATE: AppState = {
    profile: null,
    clients: [],
    projects: [],
    tasks: [],
    notes: [],
    noteLinks: [],
    documents: [],
    portfolioVideos: [],
    youtubePlaylistUrl: '',
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [appState, setAppState] = useState<AppState>(EMPTY_APP_STATE);
    const [saveStatus, setSaveStatus] = useState('');
    const saveTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const unsubs: (() => void)[] = [];

        // Public data
        unsubs.push(onSnapshot(doc(db, 'publicProfile', 'main'), doc => {
            setAppState(prev => ({ ...prev, profile: doc.data() as FreelancerProfile }));
        }));
        unsubs.push(onSnapshot(collection(db, 'publicPortfolioVideos'), snapshot => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setAppState(prev => ({ ...prev, portfolioVideos: data as PortfolioVideo[] }));
        }));

        // Private data
        if (currentUser) {
            const privateCollections: (keyof AppState)[] = ['clients', 'projects', 'tasks', 'notes', 'noteLinks', 'documents'];
            privateCollections.forEach(col => {
                unsubs.push(onSnapshot(collection(db, 'users', currentUser.uid, col), snapshot => {
                    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                    setAppState(prev => ({ ...prev, [col]: data }));
                }));
            });
        }

        return () => unsubs.forEach(unsub => unsub());
    }, [currentUser]);

    const triggerNotification = useCallback((message: string, isSave: boolean = false) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        if (isSave) {
            setSaveStatus('Sauvegarde...');
        } else {
            setSaveStatus(message);
        }

        saveTimeoutRef.current = window.setTimeout(() => {
            setSaveStatus(message);
            saveTimeoutRef.current = window.setTimeout(() => setSaveStatus(''), 2000);
        }, 300);
    }, []);

    // --- Profile Management ---
    const updateProfile = async (updates: Partial<FreelancerProfile>) => {
        if (!currentUser) return;
        try {
            const sanitizedUpdates = sanitizeData(updates);
            const profileDocRef = doc(db, 'publicProfile', 'main');
            await setDoc(profileDocRef, sanitizedUpdates, { merge: true });
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error updating profile: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    // --- Client Management ---
    const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
        if (!currentUser) throw new Error("Not authenticated");
        const newClient = { ...clientData, createdAt: new Date().toISOString() };
        try {
            const sanitizedClient = sanitizeData(newClient);
            const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'clients'), sanitizedClient);
            triggerNotification('Sauvegardé ✓', true);
            return { ...sanitizedClient, id: docRef.id };
        } catch (error) {
            console.error("Error adding client: ", error);
            triggerNotification('Erreur de sauvegarde');
            throw error;
        }
    };
    
    const updateClient = async (clientId: string, updates: Partial<Client>) => {
        if (!currentUser) return;
        try {
            const sanitizedUpdates = sanitizeData(updates);
            await updateDoc(doc(db, 'users', currentUser.uid, 'clients', clientId), sanitizedUpdates);
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error updating client: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    const deleteClient = async (clientId: string) => {
        if (!currentUser) return;
        try {
            const projectsToDelete = appState.projects.filter(p => p.clientId === clientId);
            for (const project of projectsToDelete) {
                await deleteProject(project.id);
            }
            const tasksToDelete = appState.tasks.filter(t => t.clientId === clientId);
            for (const task of tasksToDelete) {
                await deleteTask(task.id);
            }
            const documentsToDelete = appState.documents.filter(d => d.clientId === clientId);
            for (const document of documentsToDelete) {
                await deleteDoc(doc(db, 'users', currentUser.uid, 'documents', document.id));
            }
            const notesToDelete = appState.notes.filter(n => n.clientId === clientId);
            for (const note of notesToDelete) {
                await deleteNote(note.id);
            }
            await deleteDoc(doc(db, 'users', currentUser.uid, 'clients', clientId));
            triggerNotification('Client et données associées supprimés ✓', true);
        } catch (error) {
            console.error("Error deleting client and associated data: ", error);
            triggerNotification('Erreur de suppression');
        }
    };

    // --- Project Management ---
    const addProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
        if (!currentUser) throw new Error("Not authenticated");
        try {
            const sanitizedProject = sanitizeData(projectData);
            const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'projects'), sanitizedProject);
            triggerNotification('Sauvegardé ✓', true);
            return { ...sanitizedProject, id: docRef.id };
        } catch (error) {
            console.error("Error adding project: ", error);
            triggerNotification('Erreur de sauvegarde');
            throw error;
        }
    };
    
    const updateProject = async (projectId: string, updates: Partial<Project>) => {
        if (!currentUser) return;
        try {
            const sanitizedUpdates = sanitizeData(updates);
            await updateDoc(doc(db, 'users', currentUser.uid, 'projects', projectId), sanitizedUpdates);
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error updating project: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    const deleteProject = async (projectId: string) => {
        if (!currentUser) return;
        try {
            const tasksToDelete = appState.tasks.filter(t => t.projectId === projectId);
            for (const task of tasksToDelete) {
                await deleteTask(task.id);
            }
            await deleteDoc(doc(db, 'users', currentUser.uid, 'projects', projectId));
            triggerNotification('Projet et tâches associées supprimés ✓', true);
        } catch (error) {
            console.error("Error deleting project and associated tasks: ", error);
            triggerNotification('Erreur de suppression');
        }
    };

    const updateProjectStatus = async (projectId: string, status: ProjectStatus) => {
        if (!currentUser) return;
        try {
            await updateDoc(doc(db, 'users', currentUser.uid, 'projects', projectId), { status });
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error updating project status: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };
    
    // --- Task Management ---
    const addTask = async (taskData: Omit<Task, 'id'|'completed'>): Promise<Task> => {
        if (!currentUser) throw new Error("Not authenticated");
        const newTask = { ...taskData, completed: false };
        try {
            const sanitizedTask = sanitizeData(newTask);
            const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'tasks'), sanitizedTask);
            triggerNotification('Sauvegardé ✓', true);
            return { ...sanitizedTask, id: docRef.id };
        } catch (error) {
            console.error("Error adding task: ", error);
            triggerNotification('Erreur de sauvegarde');
            throw error;
        }
    };

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        if (!currentUser) return;
        try {
            const sanitizedUpdates = sanitizeData(updates);
            await updateDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId), sanitizedUpdates);
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error updating task: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId));
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error deleting task: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    // --- Note Management ---
    const addNote = async (noteData: Partial<Omit<Note, 'id'|'createdAt'>>): Promise<Note> => {
        if (!currentUser) throw new Error("Not authenticated");
        const newNote = {
            content: 'Nouvelle note...', x: 50, y: 50, width: 192, height: 192,
            color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
            rotation: Math.random() * 4 - 2, ...noteData,
            createdAt: new Date().toISOString(),
        };
        try {
            const sanitizedNote = sanitizeData(newNote);
            const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'notes'), sanitizedNote);
            triggerNotification('Sauvegardé ✓', true);
            return { ...sanitizedNote, id: docRef.id };
        } catch (error) {
            console.error("Error adding note: ", error);
            triggerNotification('Erreur de sauvegarde');
            throw error;
        }
    };

    const updateNote = async (noteId: string, updates: Partial<Note>) => {
        if (!currentUser) return;
        try {
            const sanitizedUpdates = sanitizeData(updates);
            await updateDoc(doc(db, 'users', currentUser.uid, 'notes', noteId), sanitizedUpdates);
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error updating note: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    const deleteNote = async (noteId: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'notes', noteId));
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error deleting note: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    // --- Note Link Management ---
    const addNoteLink = async (from: string, to: string) => {
        if (!currentUser || from === to) return;
        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'noteLinks'), { from, to });
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error adding note link: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    const deleteNoteLink = async (linkId: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'noteLinks', linkId));
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error deleting note link: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };
    
    const deleteLinksForNote = async (noteId: string) => {
        if (!currentUser) return;
        try {
            const linksToDelete = appState.noteLinks.filter(l => l.from === noteId || l.to === noteId);
            for (const link of linksToDelete) {
                await deleteNoteLink(link.id);
            }
        } catch (error) {
            console.error("Error deleting links for note: ", error);
        }
    };

    // --- Document Management ---
    const addDocument = async (docData: Omit<DocumentFile, 'id' | 'uploadedAt'>) => {
        if (!currentUser) return;
        const newDocument = { ...docData, uploadedAt: new Date().toISOString() };
        try {
            const sanitizedDocument = sanitizeData(newDocument);
            await addDoc(collection(db, 'users', currentUser.uid, 'documents'), sanitizedDocument);
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error adding document: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    }
    
     const addVideo = async (videoData: Omit<DocumentFile, 'id' | 'uploadedAt' | 'type'>) => {
        if (!currentUser) return;
        const newVideo = { ...videoData, uploadedAt: new Date().toISOString(), type: 'video' };
        try {
            const sanitizedVideo = sanitizeData(newVideo);
            await addDoc(collection(db, 'users', currentUser.uid, 'documents'), sanitizedVideo);
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error adding video: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    }

    // --- Portfolio Management ---
    const addPortfolioVideo = async (videoData: Omit<PortfolioVideo, 'id'|'createdAt'|'isPinned'>): Promise<PortfolioVideo> => {
        if (!currentUser) throw new Error("Not authenticated");
        const newVideo = { ...videoData, createdAt: new Date().toISOString(), isPinned: false };
        try {
            const sanitizedVideo = sanitizeData(newVideo);
            const docRef = await addDoc(collection(db, 'publicPortfolioVideos'), sanitizedVideo);
            triggerNotification('Sauvegardé ✓', true);
            return { ...sanitizedVideo, id: docRef.id };
        } catch (error) {
            console.error("Error adding portfolio video: ", error);
            triggerNotification('Erreur de sauvegarde');
            throw error;
        }
    };

    const updatePortfolioVideo = async (videoId: string, updates: Partial<PortfolioVideo>) => {
        if (!currentUser) return;
        try {
            const sanitizedUpdates = sanitizeData(updates);
            await updateDoc(doc(db, 'publicPortfolioVideos', videoId), sanitizedUpdates);
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error updating portfolio video: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    const deletePortfolioVideo = async (videoId: string) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'publicPortfolioVideos', videoId));
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error deleting portfolio video: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    const setYoutubePlaylistUrl = async (url: string) => {
        if (!currentUser) return;
        try {
            const profileDocRef = doc(db, 'publicProfile', 'main');
            await setDoc(profileDocRef, { youtubePlaylistUrl: url }, { merge: true });
            triggerNotification('Sauvegardé ✓', true);
        } catch (error) {
            console.error("Error updating youtube playlist url: ", error);
            triggerNotification('Erreur de sauvegarde');
        }
    };

    const syncPlaylist = async () => {
        const playlistUrl = appState.youtubePlaylistUrl;
        const playlistIdRegex = /(?:list=)([a-zA-Z0-9_-]+)/;
        const match = playlistUrl.match(playlistIdRegex);

        if (!match || !match[1]) {
            throw new Error('INVALID_PLAYLIST_URL');
        }
        const playlistId = match[1];

        try {
            const functions = getFunctions();
            const syncYouTubePlaylist = httpsCallable< { playlistId: string }, { videos: any[] } >(functions, 'syncYouTubePlaylist');
            const response = await syncYouTubePlaylist({ playlistId });

            const { videos: fetchedVideos } = response.data;
            
            const existingVideoUrls = new Set(appState.portfolioVideos.map(v => v.videoUrl));
            const newVideos: Omit<PortfolioVideo, 'id'>[] = [];

            fetchedVideos.forEach((item: any) => {
                const videoUrl = `https://www.youtube.com/watch?v=${item.videoId}`;
                if (!existingVideoUrls.has(videoUrl)) {
                    newVideos.push({
                        title: item.title,
                        description: item.description,
                        videoUrl: videoUrl,
                        thumbnailUrl: item.thumbnailUrl,
                        tags: ['YouTube', 'Synchronisé'],
                        isPinned: false,
                        createdAt: item.publishedAt || new Date().toISOString(),
                    });
                }
            });

            if (newVideos.length === 0) {
                triggerNotification('Portfolio déjà à jour.');
                return;
            }

            for (const video of newVideos) {
                await addDoc(collection(db, 'publicPortfolioVideos'), video);
            }

            triggerNotification(`${newVideos.length} vidéo(s) ajoutée(s) !`, true);

        } catch (error) {
            console.error("Erreur lors de la synchronisation avec le backend:", error);
            throw new Error("La communication avec le service de synchronisation a échoué. Assurez-vous que le backend fonctionne correctement.");
        }
    };


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
            addPortfolioVideo, updatePortfolioVideo, deletePortfolioVideo,
            setYoutubePlaylistUrl, syncPlaylist,
            stats, getClientById, getProjectsByClientId, 
            addDocument, addVideo, getDocumentsByClientId,
            saveStatus, triggerNotification,
            undo: () => {}, redo: () => {}, canUndo: false, canRedo: false
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
