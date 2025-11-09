
import React, { useEffect, useRef } from 'react';

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  className?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children, onClose, title, className = '' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md text-neutral-800 dark:text-neutral-200 animate-slide-up ${className}`}
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 id="modal-title" className="text-xl font-bold">{title}</h2>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }

        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ModalWrapper;
