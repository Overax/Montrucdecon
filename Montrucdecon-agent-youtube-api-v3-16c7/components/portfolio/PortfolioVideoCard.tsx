import React from 'react';
import { PortfolioVideo } from '../../types';
import { ICONS } from '../../constants';
import { useAppContext } from '../../contexts/AppContext';
import { useModal } from '../../contexts/ModalContext';

const PortfolioVideoCard: React.FC<{
    video: PortfolioVideo,
    onView: () => void,
    onEdit: () => void,
    isPublic: boolean,
}> = ({ video, onView, onEdit, isPublic }) => {
    const { updatePortfolioVideo, deletePortfolioVideo } = useAppContext();
    const { showConfirmation } = useModal();

    const handlePinToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        updatePortfolioVideo(video.id, { isPinned: !video.isPinned });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        showConfirmation({
            title: `Supprimer "${video.title}" ?`,
            message: "Cette vidéo sera retirée de votre portfolio. Cette action est irréversible.",
            onConfirm: () => deletePortfolioVideo(video.id)
        });
    };

    return (
        <div className="group relative aspect-video cursor-pointer" onClick={onView}>
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 p-4 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="font-bold text-white text-lg drop-shadow-md">{video.title}</h3>
            </div>
            {video.isPinned && (
                <div className="absolute top-2 left-2 p-1.5 bg-primary-500/80 rounded-full text-white backdrop-blur-sm" title="Épinglé">
                    <ICONS.checkCircle className="w-4 h-4" />
                </div>
            )}
            {!isPublic && (
                <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={handlePinToggle} className="p-2 bg-white/80 dark:bg-neutral-800/80 rounded-full hover:bg-white dark:hover:bg-neutral-800 backdrop-blur-sm transition-colors" title={video.isPinned ? "Désépingler" : "Épingler"}>
                        <ICONS.checkCircle className={`w-4 h-4 ${video.isPinned ? 'text-primary-500' : 'text-neutral-500'}`} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 bg-white/80 dark:bg-neutral-800/80 rounded-full hover:bg-white dark:hover:bg-neutral-800 backdrop-blur-sm transition-colors" title="Modifier">
                        <ICONS.notes className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                    </button>
                    <button onClick={handleDelete} className="p-2 bg-white/80 dark:bg-neutral-800/80 rounded-full hover:bg-red-500/20 backdrop-blur-sm transition-colors" title="Supprimer">
                        <ICONS.trash className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PortfolioVideoCard;
