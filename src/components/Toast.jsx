import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
                        ${type === 'success'
                            ? 'bg-white/90 border-green-100 text-green-800'
                            : 'bg-white/90 border-red-100 text-red-800'
                        }
                    `}
                >
                    <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {type === 'success' ? <CheckCircle size={20} className="text-green-600" /> : <XCircle size={20} className="text-red-600" />}
                    </div>
                    <span className="font-medium text-sm">{message}</span>
                    <button
                        onClick={onClose}
                        className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors opacity-60 hover:opacity-100"
                    >
                        <X size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
