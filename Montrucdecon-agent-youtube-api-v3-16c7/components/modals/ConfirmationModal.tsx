import React from 'react';
import ModalWrapper from './ModalWrapper';
import Button from '../ui/Button';

interface ConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Supprimer',
}) => {
  return (
    <ModalWrapper title={title} onClose={onClose} className="max-w-sm">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-lg font-semibold leading-6 text-neutral-900 dark:text-neutral-100" id="modal-title">{title}</h3>
            <div className="mt-2">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {message}
                </p>
            </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          className="!bg-red-600 hover:!bg-red-700 focus:ring-red-500 text-white"
        >
          {confirmText}
        </Button>
      </div>
    </ModalWrapper>
  );
};

export default ConfirmationModal;
