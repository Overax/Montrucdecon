
import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';

interface NewVideoModalProps {
  onClose: () => void;
  onVideoAdded: () => void;
  payload?: {
    clientId?: string;
  }
}

const NewVideoModal: React.FC<NewVideoModalProps> = ({ onClose, onVideoAdded, payload }) => {
  const { addVideo } = useAppContext();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !payload?.clientId) return;
    
    addVideo({
      name,
      clientId: payload.clientId,
      url,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop' // Default thumbnail
    });
    onVideoAdded();
  };

  return (
    <ModalWrapper title="Ajouter une Vidéo" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Titre de la vidéo *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Reel Instagram - Juin" required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">URL de la vidéo (optionnel)</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
        </div>
         <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">URL de la miniature (optionnel)</label>
          <input type="url" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://image.com/..." className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"/>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit">Ajouter la vidéo</Button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default NewVideoModal;