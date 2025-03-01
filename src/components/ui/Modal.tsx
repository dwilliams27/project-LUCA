import React from 'react';
import { useModal } from '@/contexts/modal-context';

export const Modal: React.FC = () => {
  const { isOpen, modalContent, closeModal } = useModal();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={closeModal}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Modal content */}
      <div 
        className="relative bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {modalContent}
      </div>
    </div>
  );
};