import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white/70 dark:bg-neutral-900/50 rounded-lg shadow-sm border border-neutral-200/80 dark:border-neutral-800/60 p-5 md:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;