
import React, { useState } from 'react';
import Button from './ui/Button';
import { useAppContext } from '../contexts/AppContext';

interface OnboardingProps {
    onComplete: () => void;
}

const ProgressBar: React.FC<{step: number, totalSteps: number}> = ({step, totalSteps}) => (
    <div className="flex justify-center items-center space-x-2 my-4">
        {Array.from({length: totalSteps}).map((_, i) => (
            <div key={i} className={`w-1/3 h-1.5 rounded-full transition-colors ${i < step ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
        ))}
    </div>
)

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const { updateProfile, addClient, addProject, clients } = useAppContext();
    
    const [profileName, setProfileName] = useState('');
    const [profileTitle, setProfileTitle] = useState('Monteur Vidéo');

    const [clientName, setClientName] = useState('');
    const [clientCompany, setClientCompany] = useState('');
    const [clientEmail, setClientEmail] = useState('');

    const [projectName, setProjectName] = useState('');
    const [projectRevenue, setProjectRevenue] = useState(500);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile({ name: profileName, title: profileTitle });
        setStep(2);
    };

    const handleClientSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addClient({ name: clientName, company: clientCompany, email: clientEmail, phone: '', tags: [] });
        setStep(3);
    };
    
    const handleProjectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use the most recently added client, or the first one if none were just added.
        const targetClientId = clients.length > 0 ? clients[clients.length - 1].id : null;
        if (targetClientId) {
            addProject({
                clientId: targetClientId,
                name: projectName,
                status: 'À Démarrer',
                deadline: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
                estimatedRevenue: projectRevenue
            });
        }
        onComplete();
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Bienvenue !</h2>
                            <p className="text-neutral-500">Commençons par configurer votre profil.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Votre Nom</label>
                            <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Ex: Jean Dupont" required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Votre Titre</label>
                            <input type="text" value={profileTitle} onChange={e => setProfileTitle(e.target.value)} className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
                        </div>
                        <Button type="submit" className="w-full !mt-6">Continuer</Button>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleClientSubmit} className="space-y-4">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Ajoutez votre premier client</h2>
                            <p className="text-neutral-500">C'est parti pour votre premier contact.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Nom du client</label>
                            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: Marie Curie" required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Société (optionnel)</label>
                            <input type="text" value={clientCompany} onChange={e => setClientCompany(e.target.value)} placeholder="Ex: Acme Inc." className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Email</label>
                            <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="marie@example.com" required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
                        </div>
                        <div className="flex space-x-2 !mt-6">
                           <Button onClick={() => setStep(3)} variant="secondary" className="w-full">Passer</Button>
                           <Button type="submit" className="w-full">Ajouter le client</Button>
                        </div>
                    </form>
                );
            case 3:
                 return (
                    <form onSubmit={handleProjectSubmit} className="space-y-4">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Créez votre premier projet</h2>
                            <p className="text-neutral-500">Organisez votre travail dès maintenant.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Nom du projet</label>
                            <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Ex: Vidéo promotionnelle" required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Revenu estimé (€)</label>
                            <input type="number" value={projectRevenue} onChange={e => setProjectRevenue(Number(e.target.value))} required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
                        </div>
                        <Button type="submit" className="w-full !mt-6">Terminer et commencer !</Button>
                    </form>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-neutral-800 dark:text-neutral-200">
                <ProgressBar step={step} totalSteps={3} />
                {renderStep()}
            </div>
        </div>
    );
};

export default Onboarding;