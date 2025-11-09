
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from './ui/Card';
import Button from './ui/Button';
import { ICONS, PROJECT_STATUS_COLORS } from '../constants';
import type { Note, Project, Client } from '../types';
import { GoogleGenAI } from "@google/genai";
import Avatar from './ui/Avatar';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface ClientDetailProps {
    clientId: string;
    onBack: () => void;
    openModal: (type: 'newProject' | 'newVideo', payload: any) => void;
}

const NoteCard: React.FC<{ note: Note, onUpdate: (id: string, content: string) => void, onDelete: (id: string) => void }> = ({ note, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(note.content);

    const handleBlur = () => {
        setIsEditing(false);
        onUpdate(note.id, content);
    }

    return (
        <Card className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-900/50 h-48 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            {isEditing ? (
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleBlur}
                    autoFocus
                    className="w-full h-full bg-transparent resize-none focus:outline-none text-sm font-medium"
                />
            ) : (
                 <p onClick={() => setIsEditing(true)} className="text-sm font-medium whitespace-pre-wrap flex-1 cursor-text">{note.content}</p>
            )}
            <div className="text-right mt-2">
                <button onClick={() => onDelete(note.id)} className="text-xs text-neutral-400 hover:text-red-500 transition-colors">Supprimer</button>
            </div>
        </Card>
    )
}

const StatCard: React.FC<{title: string, value: string | number, icon: React.ReactNode}> = ({ title, value, icon }) => (
    <Card className="flex items-center space-x-4">
        <div className="p-3 bg-primary-100 dark:bg-primary-500/20 rounded-lg text-primary-600 dark:text-primary-300">
           {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
            <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{value}</p>
        </div>
    </Card>
);

const ProjectListItem: React.FC<{project: Project}> = ({ project }) => (
    <div className="flex items-center justify-between p-3 bg-neutral-100/50 dark:bg-neutral-800/60 rounded-lg">
        <div>
            <p className="font-semibold">{project.name}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{new Date(project.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
        </div>
        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${PROJECT_STATUS_COLORS[project.status]}`}>{project.status}</span>
    </div>
);

const GeminiActionPlan: React.FC<{notes: Note[]}> = ({ notes }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [error, setError] = useState('');

    const handleAiAnalysis = async () => {
        setIsLoading(true);
        setError('');
        setAiResponse('');

        if (notes.length === 0) {
            setError("Veuillez ajouter au moins une note pour lancer l'analyse.");
            setIsLoading(false);
            return;
        }

        const notesContent = notes.map(n => `- ${n.content}`).join('\n');
        const prompt = `
            En tant qu'assistant expert pour un monteur vidéo freelance, analyse les notes suivantes concernant un client. 
            Génère un plan d'action concis et pertinent sous forme de liste à puces. 
            Les actions doivent être directement exploitables (ex: "Proposer une série de 3 Reels sur le thème X", "Planifier un point sur le projet Y", "Envoyer la facture Z").
            
            Notes du client :
            ${notesContent}
        `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setAiResponse(response.text);
        } catch (e) {
            console.error(e);
            setError("Une erreur est survenue lors de l'analyse IA. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="col-span-1 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">Plan d'Action (Gemini Flash)</h3>
                <Button size="sm" onClick={handleAiAnalysis} disabled={isLoading} leftIcon={<ICONS.sparkles className="w-4 h-4" />}>
                    {isLoading ? "Analyse en cours..." : "Générer un plan"}
                </Button>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}
            {aiResponse && (
                 <div className="prose prose-sm dark:prose-invert max-w-none bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-md">
                    <p className="whitespace-pre-wrap font-sans">{aiResponse}</p>
                </div>
            )}
             {!aiResponse && !isLoading && !error && (
                <div className="text-center text-neutral-500 p-4">
                    <p>Cliquez pour générer des suggestions basées sur vos notes.</p>
                </div>
            )}
        </Card>
    );
}

const GeminiStrategicAnalysis: React.FC<{client: Client, projects: Project[], notes: Note[]}> = ({ client, projects, notes }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [error, setError] = useState('');

    const handleAiAnalysis = async () => {
        setIsLoading(true);
        setError('');
        setAiResponse('');

        const clientData = `
            Client: ${client.name} (${client.company})
            - Email: ${client.email}
            - Tags: ${client.tags.join(', ')}
        `;
        const projectsData = projects.map(p => 
            `- Projet: "${p.name}", Statut: ${p.status}, Revenu: ${p.estimatedRevenue}€, Échéance: ${new Date(p.deadline).toLocaleDateString()}`
        ).join('\n');
        const notesData = notes.map(n => `- ${n.content}`).join('\n');

        const prompt = `
            En tant que consultant stratégique pour un monteur vidéo freelance, effectue une analyse approfondie et complexe du client suivant.
            Utilise ta capacité de raisonnement avancée pour identifier des opportunités de croissance, des risques potentiels, et des suggestions pour améliorer la relation et la valeur à long terme.

            Voici les données complètes :

            **Informations sur le client :**
            ${clientData}

            **Projets avec ce client :**
            ${projectsData || "Aucun projet pour le moment."}

            **Notes sur ce client :**
            ${notesData || "Aucunes notes pour le moment."}

            Fournis une analyse stratégique structurée avec les sections suivantes :
            1.  **Synthèse et Potentiel :** Résume le profil du client et son potentiel de valeur (faible, moyen, élevé).
            2.  **Opportunités Clés :** Identifie 3 à 5 opportunités concrètes et actionnables pour augmenter les revenus ou la collaboration (ex: proposer des contrats de retainer, étendre les services à d'autres plateformes, etc.).
            3.  **Risques et Points de Vigilance :** Souligne les risques potentiels (ex: dépendance à un seul type de projet, concurrence, retards de paiement implicites dans les notes).
            4.  **Plan de Communication :** Suggère des angles et des moments clés pour aborder les opportunités identifiées avec le client.
        `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            });
            setAiResponse(response.text);
        } catch (e) {
            console.error(e);
            setError("Une erreur est survenue lors de l'analyse stratégique. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="col-span-1 lg:col-span-3">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 flex items-center">
                    <ICONS.sparkles className="w-5 h-5 mr-2 text-purple-500"/>
                    Analyse Stratégique (Gemini Pro)
                </h3>
                <Button size="sm" onClick={handleAiAnalysis} disabled={isLoading} variant="secondary">
                    {isLoading ? "Réflexion en cours..." : "Lancer l'analyse"}
                </Button>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}
            {aiResponse && (
                 <div className="prose prose-sm dark:prose-invert max-w-none bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-md">
                    <p className="whitespace-pre-wrap font-sans">{aiResponse}</p>
                </div>
            )}
            {!aiResponse && !isLoading && !error && (
                <div className="text-center text-neutral-500 p-4">
                    <p>Obtenez une analyse approfondie de votre relation client, des opportunités et des risques.</p>
                </div>
            )}
        </Card>
    )
}

const TagEditor: React.FC<{ tags: string[], onChange: (newTags: string[]) => void }> = ({ tags, onChange }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim() && !tags.includes(inputValue.trim())) {
            e.preventDefault();
            onChange([...tags, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {tags.map(tag => (
                <div key={tag} className="flex items-center bg-neutral-200 dark:bg-neutral-700 rounded-full px-3 py-1 text-sm font-medium">
                    <span>{tag}</span>
                    <button onClick={() => handleRemoveTag(tag)} className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Ajouter un tag..."
                className="bg-transparent focus:outline-none p-1 text-sm"
            />
        </div>
    );
};


const ClientDetail: React.FC<ClientDetailProps> = ({ clientId, onBack, openModal }) => {
    const { getClientById, getProjectsByClientId, getNotesByClientId, addNote, updateNote, deleteNote, getDocumentsByClientId, updateClient } = useAppContext();
    
    const client = getClientById(clientId);
    const projects = getProjectsByClientId(clientId);
    const notes = getNotesByClientId(clientId);
    const videos = getDocumentsByClientId(clientId).filter(doc => doc.type === 'video');

    if (!client) {
        return (
            <div className="text-center">
                <p>Client non trouvé.</p>
                <Button onClick={onBack}>Retour à la liste</Button>
            </div>
        );
    }
    
    const ongoingProjects = projects.filter(p => p.status === 'En Cours' || p.status === 'En Révision' || p.status === 'À Démarrer');
    const completedProjects = projects.filter(p => p.status === 'Terminé');
    const totalRevenue = projects.reduce((sum, p) => sum + p.estimatedRevenue, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                     <button onClick={onBack} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex-shrink-0">
                        <ICONS.arrowLeft className="w-6 h-6 text-neutral-500" />
                    </button>
                    <Avatar src={client.avatarUrl} name={client.name} className="w-16 h-16 border-4 border-white dark:border-neutral-800 shadow-md"/>
                    <div>
                        <h2 className="text-2xl font-bold">{client.name}</h2>
                        <p className="text-neutral-500">{client.company}</p>
                         <div className="mt-2">
                            <TagEditor tags={client.tags} onChange={(newTags) => updateClient(client.id, { tags: newTags })} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 self-end md:self-center">
                    <Button variant="secondary" size="sm">Nouvelle Facture</Button>
                    <Button size="sm" onClick={() => openModal('newProject', { clientId })}>Nouveau Projet</Button>
                </div>
            </header>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <Card className="lg:col-span-3">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Projets au total" value={projects.length} icon={<ICONS.projects className="w-6 h-6"/>} />
                        <StatCard title="Projets Actifs" value={ongoingProjects.length} icon={<ICONS.timeline className="w-6 h-6"/>} />
                        <StatCard title="Revenus Générés" value={`${totalRevenue.toLocaleString('fr-FR')}€`} icon={<span className="text-xl font-bold w-6 h-6 flex items-center justify-center">€</span>} />
                     </div>
                </Card>
                
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Projets</h3>
                    <div className="space-y-4">
                        {ongoingProjects.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2 text-neutral-500">En cours</h4>
                                <div className="space-y-2">
                                    {ongoingProjects.map(p => <ProjectListItem key={p.id} project={p} />)}
                                </div>
                            </div>
                        )}
                        {completedProjects.length > 0 && (
                             <div>
                                <h4 className="font-semibold text-sm mb-2 text-neutral-500">Terminés</h4>
                                <div className="space-y-2">
                                    {completedProjects.map(p => <ProjectListItem key={p.id} project={p} />)}
                                </div>
                            </div>
                        )}
                         {projects.length === 0 && (
                            <p className="text-center text-neutral-500 py-4">Aucun projet pour ce client.</p>
                        )}
                    </div>
                </Card>
                 <Card>
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Galerie Vidéo</h3>
                     <div className="grid grid-cols-2 gap-3">
                        {videos.map(video => (
                            <a href={video.url} target="_blank" rel="noopener noreferrer" key={video.id} className="relative aspect-video rounded-md overflow-hidden group">
                                <img src={video.thumbnailUrl} alt={video.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ICONS.video className="w-8 h-8 text-white" />
                                </div>
                            </a>
                        ))}
                    </div>
                     <Button variant="secondary" size="sm" className="w-full mt-4" onClick={() => openModal('newVideo', { clientId })}>Ajouter une vidéo</Button>
                </Card>

                {/* Gemini AI Thinking Mode Block */}
                <GeminiStrategicAnalysis client={client} projects={projects} notes={notes} />

                {/* Gemini AI Quick Action Block */}
                <GeminiActionPlan notes={notes} />
                
                 <Card className="col-span-1 lg:col-span-3">
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4">Notes Créatives</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {notes.map(note => (
                            <NoteCard key={note.id} note={note} onUpdate={(id, content) => updateNote(id, { content })} onDelete={deleteNote} />
                        ))}
                        <button 
                            onClick={() => addNote({ clientId, content: 'Nouvelle idée...' })}
                            className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg flex flex-col items-center justify-center h-48 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:border-primary-500 hover:text-primary-500 transition-all"
                        >
                            <ICONS.plus className="w-8 h-8 mb-2"/>
                            <span className="font-semibold">Ajouter une note</span>
                        </button>
                    </div>
                 </Card>
                 <Card className="col-span-1 lg:col-span-3 flex flex-col items-center justify-center text-center text-neutral-500 p-8">
                    <ICONS.document className="w-10 h-10 mb-2 text-neutral-400" />
                    <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">Factures & Devis</h3>
                    <p className="text-sm">Une section dédiée à la facturation arrive prochainement.</p>
                </Card>
            </div>
        </div>
    );
};

export default ClientDetail;
