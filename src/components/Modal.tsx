import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'info'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
            type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'
          }`}>
            {type === 'danger' ? <AlertTriangle size={32} /> : <X size={32} />}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{title}</h3>
          <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 px-4 text-white rounded-xl font-bold transition-all shadow-lg ${
                type === 'danger' 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                  : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
