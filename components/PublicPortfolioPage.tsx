import React, { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import PortfolioVideoCard from './portfolio/PortfolioVideoCard';
import ViewVideoModal from './portfolio/ViewVideoModal';
import Avatar from './ui/Avatar';
import { PortfolioVideo, FreelancerProfile } from '../types';

const PublicPortfolioPage: React.FC = () => {
    const [profile, setProfile] = useState<FreelancerProfile | null>(null);
    const [portfolioVideos, setPortfolioVideos] = useState<PortfolioVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [videoToView, setVideoToView] = useState<PortfolioVideo | null>(null);

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                const profileDoc = await getDoc(doc(db, 'publicProfile', 'main'));
                if (profileDoc.exists()) {
                    setProfile(profileDoc.data() as FreelancerProfile);
                }

                const videosSnapshot = await getDocs(collection(db, 'publicPortfolioVideos'));
                const videos = videosSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as PortfolioVideo[];
                setPortfolioVideos(videos);
            } catch (error) {
                console.error("Error fetching public data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicData();
    }, []);

    const pinnedVideos = portfolioVideos.filter(v => v.isPinned);
    const otherVideos = portfolioVideos.filter(v => !v.isPinned);

    if (loading) {
        return <div className="w-full h-screen flex items-center justify-center">Chargement...</div>;
    }

    return (
        <div className="w-full min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-sans p-4 sm:p-8 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-12">
                    <Avatar src={profile.avatarUrl} name={profile.name} className="w-24 h-24 mx-auto mb-4 border-4 border-white dark:border-neutral-800 shadow-lg"/>
                    <h1 className="text-3xl md:text-4xl font-bold">{profile.name}</h1>
                    <p className="text-lg text-neutral-500 dark:text-neutral-400">{profile.title}</p>
                </header>
                <main>
                    {portfolioVideos.length > 0 ? (
                         <>
                            {pinnedVideos.length > 0 && (
                                <div className="mb-12">
                                    <h3 className="text-2xl font-semibold mb-6 text-neutral-700 dark:text-neutral-200">Projets à la une</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {pinnedVideos.map(video => <PortfolioVideoCard key={video.id} video={video} onView={() => setVideoToView(video)} onEdit={() => {}} isPublic={true} />)}
                                    </div>
                                </div>
                            )}
                            <div>
                                <h3 className="text-2xl font-semibold mb-6 text-neutral-700 dark:text-neutral-200">Galerie</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {otherVideos.map(video => <PortfolioVideoCard key={video.id} video={video} onView={() => setVideoToView(video)} onEdit={() => {}} isPublic={true} />)}
                                </div>
                            </div>
                        </>
                    ) : (
                         <div className="text-center py-20 text-neutral-500">
                            <p>Ce portfolio est actuellement vide.</p>
                        </div>
                    )}
                </main>
                <footer className="text-center mt-16 text-sm text-neutral-400 dark:text-neutral-500">
                    <p>Portfolio propulsé par Monteur Vidéo CRM</p>
                </footer>
            </div>
            {videoToView && <ViewVideoModal video={videoToView} onClose={() => setVideoToView(null)} />}
        </div>
    );
};

export default PublicPortfolioPage;
