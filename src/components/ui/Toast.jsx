import React, { useEffect } from 'react';

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            
            return () => clearTimeout(timer);
        }
    }, [message, onClose, duration]);

    if (!message) return null;

    return (
        <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
            type === 'error' 
                ? 'bg-red-500 text-white' 
                : type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
        }`}>
            <div className="flex items-center justify-between max-w-sm">
                <span className="text-sm">{message}</span>
                <button 
                    onClick={onClose}
                    className="ml-4 text-white hover:text-gray-200 flex-shrink-0"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast; 