import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { PortfolioVideo } from '../../types';

interface NewPortfolioVideoModalProps {
  onClose: () => void;
  onVideoCreated: () => void; // Used for both create and update
  payload?: {
    video?: PortfolioVideo;
  }
}

// --- Helper to get thumbnail from YouTube URL ---
const getYouTubeThumbnail = (url: string): string => {
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        if (match) videoId = match[1];
    }
    return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

const NewPortfolioVideoModal: React.FC<NewPortfolioVideoModalProps> = ({ onClose, onVideoCreated, payload }) => {
  const { addPortfolioVideo, updatePortfolioVideo, projects } = useAppContext();
  const isEditing = !!payload?.video;
  
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    if (isEditing && payload.video) {
        const { video } = payload;
        setTitle(video.title);
        setVideoUrl(video.videoUrl);
        setThumbnailUrl(video.thumbnailUrl);
        setDescription(video.description);
        setTags(video.tags);
        setProjectId(video.projectId || '');
    }
  }, [isEditing, payload]);

  useEffect(() => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const thumb = getYouTubeThumbnail(videoUrl);
        if(thumb) setThumbnailUrl(thumb);
    }
  }, [videoUrl]);
  
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
        e.preventDefault();
        const newTags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
        setTags(prev => [...new Set([...prev, ...newTags])]);
        setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) return;

    const videoData = {
        title,
        videoUrl,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop',
        description,
        tags,
        projectId: projectId || undefined
    };

    if (isEditing && payload.video) {
        updatePortfolioVideo(payload.video.id, videoData);
    } else {
        addPortfolioVideo(videoData);
    }
    onVideoCreated();
  };

  return (
    <ModalWrapper title={isEditing ? "Modifier la vidéo" : "Ajouter une vidéo au portfolio"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Titre *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Showreel 2024" required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">URL de la vidéo (YouTube, Vimeo...) *</label>
          <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." required className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">URL de la miniature (auto-rempli pour YouTube)</label>
          <div className="flex items-center space-x-2">
            <input type="url" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://image.com/..." className="flex-1 w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
            {thumbnailUrl && <img src={thumbnailUrl} alt="Aperçu" className="w-20 h-12 object-cover rounded-md" />}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Courte description de la vidéo..." className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Tags (séparés par une virgule)</label>
          <div className="p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg flex flex-wrap gap-2">
            {tags.map(tag => (
                <div key={tag} className="flex items-center bg-primary-200 dark:bg-primary-800 rounded-full px-2 py-0.5 text-sm font-medium text-primary-800 dark:text-primary-100">
                    <span>{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ))}
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className="bg-transparent focus:outline-none flex-1 min-w-[120px]"/>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Lier à un projet (optionnel)</label>
          <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg">
            <option value="">Aucun projet lié</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit">{isEditing ? 'Sauvegarder' : 'Ajouter la vidéo'}</Button>
        </div>
      </form>
    </ModalWrapper>
  );
};
export default NewPortfolioVideoModal;
