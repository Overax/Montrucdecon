import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { PortfolioVideo } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { ICONS } from '../constants';
import ViewVideoModal from './portfolio/ViewVideoModal';
import PortfolioVideoCard from './portfolio/PortfolioVideoCard';

const Portfolio: React.FC<{ openModal: (type: 'newPortfolioVideo', payload?: any) => void; }> = ({ openModal }) => {
    const { portfolioVideos, youtubePlaylistUrl, setYoutubePlaylistUrl, syncPlaylist, triggerNotification } = useAppContext();
    const [isPublic, setIsPublic] = useState(false);
    const [videoToView, setVideoToView] = useState<PortfolioVideo | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState('');

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncError('');
        try {
            await syncPlaylist();
        } catch (error: any) {
            let errorMessage = "Une erreur est survenue. Veuillez réessayer.";
            if (error.message === 'INVALID_PLAYLIST_URL') {
                errorMessage = "L'URL de la playlist semble invalide. Vérifiez le lien et réessayez.";
            } else if (error.message === 'PLAYLIST_NOT_FOUND') {
                errorMessage = "Playlist non trouvée. Assurez-vous qu'elle est publique et que le lien est correct.";
            } else if (error.message === 'YOUTUBE_API_KEY_INVALID') {
                errorMessage = "La clé API n'est pas valide pour YouTube. Veuillez vérifier la clé dans l'application.";
            }
            setSyncError(errorMessage);
        } finally {
            setIsSyncing(false);
        }
    };
    
    const handleShare = () => {
        const publicUrl = `${window.location.origin}${window.location.pathname}?share=portfolio`;
        navigator.clipboard.writeText(publicUrl).then(() => {
            triggerNotification('Lien public du portfolio copié !');
        }).catch(err => {
            console.error("Impossible de copier le lien:", err);
            triggerNotification('Erreur lors de la copie du lien.');
        });
    };

    const pinnedVideos = portfolioVideos.filter(v => v.isPinned);
    const otherVideos = portfolioVideos.filter(v => !v.isPinned);

    return (
        <div className="flex flex-col h-full">
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold">Paramètres du Portfolio</h2>
                        <p className="text-sm text-neutral-500">Gérez la visibilité et le contenu de votre page portfolio.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${isPublic ? 'text-primary-600' : 'text-neutral-500'}`}>{isPublic ? 'Public' : 'Privé'}</span>
                            <button onClick={() => setIsPublic(!isPublic)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleShare}>Partager</Button>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/60">
                    <label htmlFor="youtube-playlist" className="block text-sm font-medium mb-1 text-neutral-600 dark:text-neutral-300">Synchronisation YouTube</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <input
                            id="youtube-playlist"
                            type="url"
                            value={youtubePlaylistUrl}
                            onChange={(e) => setYoutubePlaylistUrl(e.target.value)}
                            placeholder="Coller le lien de votre playlist ici..."
                            className="flex-grow w-full p-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Button onClick={handleSync} disabled={isSyncing || !youtubePlaylistUrl} className="w-full sm:w-auto flex-shrink-0">
                            {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
                        </Button>
                    </div>
                     {syncError && (
                        <div className="mt-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
                            <p>{syncError}</p>
                        </div>
                    )}
                </div>
            </Card>

            <div className="flex-1 overflow-y-auto -mx-4 px-4">
                {portfolioVideos.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <ICONS.video className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                        <h3 className="text-xl font-semibold">Votre portfolio est vide</h3>
                        <p className="text-neutral-500 mb-4">Ajoutez votre première vidéo pour commencer à impressionner vos clients.</p>
                        <Button onClick={() => openModal('newPortfolioVideo')}>Ajouter une vidéo</Button>
                    </div>
                ) : (
                    <>
                        {pinnedVideos.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-neutral-700 dark:text-neutral-200">Épinglés</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pinnedVideos.map(video => <PortfolioVideoCard key={video.id} video={video} onView={() => setVideoToView(video)} onEdit={() => openModal('newPortfolioVideo', { video })} isPublic={false} />)}
                                </div>
                            </div>
                        )}
                         <div>
                             <h3 className="text-xl font-semibold mb-4 text-neutral-700 dark:text-neutral-200">Toutes les vidéos</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                 {otherVideos.map(video => <PortfolioVideoCard key={video.id} video={video} onView={() => setVideoToView(video)} onEdit={() => openModal('newPortfolioVideo', { video })} isPublic={false} />)}
                             </div>
                         </div>
                    </>
                )}
            </div>
            {videoToView && <ViewVideoModal video={videoToView} onClose={() => setVideoToView(null)} />}
        </div>
    )
}
export default Portfolio;