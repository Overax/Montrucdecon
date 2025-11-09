import React, { useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';

const SaveStatusIndicator: React.FC = () => {
    const { saveStatus } = useAppContext();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (saveStatus) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [saveStatus]);

    return (
        <div 
            className={`fixed bottom-5 right-5 z-50 px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-all duration-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            } ${
                saveStatus.includes('Erreur') ? 'bg-red-500 text-white' : 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
            }`}
        >
            {saveStatus}
        </div>
    );
};

export default SaveStatusIndicator;
