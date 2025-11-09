
import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, className = '' }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    
    return (
        <div className={`flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 font-bold overflow-hidden shrink-0 ${className}`}>
            {src ? (
                <img src={src} alt={name} className="w-full h-full object-cover" onError={(e) => {
                    // In case of invalid URL, hide the img to show the initial
                    (e.target as HTMLImageElement).style.display = 'none';
                }}/>
            ) : (
                <span>{initial}</span>
            )}
        </div>
    );
}
export default Avatar;
