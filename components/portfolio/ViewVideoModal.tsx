import React from 'react';
import { PortfolioVideo } from '../../types';
import ModalWrapper from '../modals/ModalWrapper';
import Button from '../ui/Button';

// --- Helper to extract YouTube video ID and create embed URL ---
const getYouTubeEmbedUrl = (url: string): string | null => {
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        // Fallback for simple regex if URL constructor fails
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        if (match) videoId = match[1];
    }
    
    if (videoId) {
        const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
        // Adding origin is crucial for some environments to allow the embed.
        if (typeof window !== 'undefined') {
            embedUrl.searchParams.append('origin', window.location.origin);
        }
        embedUrl.searchParams.append('autoplay', '1');
        return embedUrl.toString();
    }
    
    return null;
};

const ViewVideoModal: React.FC<{ video: PortfolioVideo, onClose: () => void }> = ({ video, onClose }) => (
    <ModalWrapper title={video.title} onClose={onClose} className="max-w-4xl">
        <div className="aspect-video bg-black rounded-lg">
            <iframe
                src={getYouTubeEmbedUrl(video.videoUrl) || video.videoUrl}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
            ></iframe>
        </div>
        <div className="mt-4 flex justify-between items-start gap-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{video.description}</p>
            </div>
             <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <Button variant="secondary" size="sm" className="inline-flex items-center">
                    Voir sur YouTube
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </Button>
            </a>
        </div>
    </ModalWrapper>
);

export default ViewVideoModal;
