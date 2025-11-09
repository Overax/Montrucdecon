import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import ConfirmationModal from '../components/modals/ConfirmationModal';

export interface ConfirmationModalConfig {
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    confirmText?: string;
}

interface ModalContextType {
    showConfirmation: (config: ConfirmationModalConfig) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [confirmationConfig, setConfirmationConfig] = useState<ConfirmationModalConfig | null>(null);

    const showConfirmation = useCallback((config: ConfirmationModalConfig) => {
        setConfirmationConfig(config);
    }, []);

    const handleConfirm = () => {
        if (confirmationConfig) {
            confirmationConfig.onConfirm();
            setConfirmationConfig(null);
        }
    };

    const handleClose = () => {
        setConfirmationConfig(null);
    };

    return (
        <ModalContext.Provider value={{ showConfirmation }}>
            {children}
            {confirmationConfig && (
                <ConfirmationModal
                    {...confirmationConfig}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                />
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
