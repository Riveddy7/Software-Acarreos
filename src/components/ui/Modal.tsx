
'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center p-4"> {/* Darker, more opaque overlay */}
      <div className={`bg-white rounded-lg shadow-2xl w-full ${sizeClasses[size]} p-6 lg:p-8 m-4 border border-gray-200`}> {/* Added border for definition */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200"> {/* Added bottom border to header */}
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2> {/* Slightly less bold, consistent text color */}
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-3xl font-normal leading-none transition-colors" // Adjusted button style
          >
            &times;
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
