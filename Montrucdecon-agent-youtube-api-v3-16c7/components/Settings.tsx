import React, { useState, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import Card from './ui/Card';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import { FreelancerProfile } from '../types';

const SettingsField: React.FC<{ 
    label: string, 
    name: keyof FreelancerProfile, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    placeholder?: string, 
    type?: string 
}> = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors"
        />
    </div>
);

const SectionHeader: React.FC<{ title: string, subtitle: string }> = ({ title, subtitle }) => (
    <div className="mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
    </div>
);

const Settings: React.FC = () => {
    const { profile, updateProfile } = useAppContext();
    const { theme, toggleTheme } = useTheme();
    const [localProfile, setLocalProfile] = useState<FreelancerProfile>(profile);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const key = name as keyof FreelancerProfile;
        const updatedProfile = { ...localProfile, [key]: value };
        setLocalProfile(updatedProfile);
        updateProfile({ [key]: value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setLocalProfile(p => ({...p, avatarUrl: result}));
                updateProfile({ avatarUrl: result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-10">
            <section>
                <SectionHeader title="Profil" subtitle="Gérez vos informations personnelles et professionnelles." />
                <Card>
                    <div className="flex items-center space-x-6 mb-6">
                        <Avatar src={localProfile.avatarUrl} name={localProfile.name} className="w-24 h-24 text-4xl" />
                        <div>
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Changer d'avatar</Button>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAvatarChange} />
                            <p className="text-xs text-neutral-500 mt-2">PNG, JPG, GIF jusqu'à 5MB.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SettingsField label="Nom / Pseudo" name="name" value={localProfile.name || ''} onChange={handleProfileChange} placeholder="Votre nom complet" />
                        <SettingsField label="Titre Professionnel" name="title" value={localProfile.title || ''} onChange={handleProfileChange} placeholder="Ex: Monteur Vidéo, Motion Designer" />
                        <SettingsField label="Email" name="email" type="email" value={localProfile.email || ''} onChange={handleProfileChange} placeholder="votre@email.com" />
                        <SettingsField label="Téléphone" name="phone" type="tel" value={localProfile.phone || ''} onChange={handleProfileChange} placeholder="06 12 34 56 78" />
                        <div className="md:col-span-2">
                             <SettingsField label="Adresse" name="address" value={localProfile.address || ''} onChange={handleProfileChange} placeholder="123 Rue de la Créativité, 75001 Paris" />
                        </div>
                        <SettingsField label="Identifiant Pro (SIRET...)" name="proId" value={localProfile.proId || ''} onChange={handleProfileChange} placeholder="123 456 789 00010" />
                        <SettingsField label="Portfolio / LinkedIn" name="portfolioUrl" value={localProfile.portfolioUrl || ''} onChange={handleProfileChange} placeholder="https://votre-portfolio.com" />
                    </div>
                </Card>
            </section>

            <section>
                 <SectionHeader title="Personnalisation" subtitle="Adaptez l'interface à votre goût." />
                 <Card>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Thème Visuel</h3>
                                <p className="text-sm text-neutral-500">Choisissez entre le mode clair ou sombre.</p>
                            </div>
                            <div className="flex items-center space-x-2 p-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg">
                                <Button size="sm" variant={theme === 'light' ? 'primary' : 'secondary'} onClick={theme === 'dark' ? toggleTheme : undefined} className="!shadow-none !transform-none">Clair</Button>
                                <Button size="sm" variant={theme === 'dark' ? 'primary' : 'secondary'} onClick={theme === 'light' ? toggleTheme : undefined} className="!shadow-none !transform-none">Sombre</Button>
                            </div>
                        </div>
                        <div className="opacity-50 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                             <h3 className="font-semibold">Langue</h3>
                             <p className="text-sm text-neutral-500">Bientôt disponible.</p>
                        </div>
                        <div className="opacity-50 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                             <h3 className="font-semibold">Couleur d'accentuation</h3>
                             <p className="text-sm text-neutral-500">Bientôt disponible.</p>
                        </div>
                    </div>
                 </Card>
            </section>
            
            <section>
                <SectionHeader title="Sécurité" subtitle="Gérez votre mot de passe et vos connexions." />
                <Card>
                    <div className="space-y-4">
                        <Button disabled>Changer le mot de passe</Button>
                        <p className="text-sm text-neutral-500">La gestion des mots de passe et des connexions sociales sera bientôt disponible.</p>
                    </div>
                </Card>
            </section>

            <section>
                <SectionHeader title="Notifications" subtitle="Choisissez comment et quand vous souhaitez être notifié." />
                 <Card>
                    <div className="space-y-4 opacity-50">
                        <p className="text-sm text-neutral-500">Les paramètres de notification seront bientôt disponibles.</p>
                    </div>
                </Card>
            </section>
        </div>
    );
};

export default Settings;
