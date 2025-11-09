
import React, { useState, useRef } from 'react';
import ModalWrapper from './ModalWrapper';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import type { Client } from '../../types';
import Avatar from '../ui/Avatar';

interface NewClientModalProps {
  onClose: () => void;
  onClientCreated: (newClient: Client) => void;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ onClose, onClientCreated }) => {
  const { addClient } = useAppContext();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const result = reader.result as string;
              setAvatarUrl(result);
              setAvatarPreview(result);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setAvatarUrl(url);
      setAvatarPreview(url);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const newClient = addClient({
      name,
      company,
      email,
      phone,
      avatarUrl: avatarUrl || undefined,
      tags: []
    });
    onClientCreated(newClient);
  };

  return (
    <ModalWrapper title="Nouveau Client" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Nom complet *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Sophie Durand" required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Ex: sophie.d@influence.co" required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
        </div>
         <div>
            <label className="block text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-300">Avatar (Optionnel)</label>
            <div className="flex items-center space-x-4">
                <Avatar src={avatarPreview} name={name} className="w-16 h-16" />
                <div className="flex-1 space-y-2">
                    <input 
                        type="text" 
                        value={avatarUrl.startsWith('data:image') ? 'Image téléchargée' : avatarUrl}
                        onChange={handleUrlChange}
                        placeholder="Coller une URL d'image..."
                        className="w-full p-2 text-sm bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        disabled={avatarUrl.startsWith('data:image')}
                    />
                     <Button type="button" variant="secondary" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
                        ou Télécharger une image
                     </Button>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        hidden 
                        accept="image/*"
                        onChange={handleFileChange}
                     />
                </div>
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Société (optionnel)</label>
          <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Ex: Influence & Co" className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Téléphone (optionnel)</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex: 06 12 34 56 78" className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit">Créer le client</Button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default NewClientModal;
