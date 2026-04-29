/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmação',
  message,
  confirmLabel = 'Sim, Excluir',
  cancelLabel = 'Cancelar',
  variant = 'danger'
}) => {
  const themes = {
    danger: {
      icon: 'text-red-500',
      bg: 'bg-red-50',
      button: 'bg-red-500 hover:bg-red-600 shadow-red-200',
      border: 'border-red-100'
    },
    warning: {
      icon: 'text-amber-500',
      bg: 'bg-amber-50',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
      border: 'border-amber-100'
    },
    info: {
      icon: 'text-brand',
      bg: 'bg-brand/5',
      button: 'bg-brand hover:bg-brand/90 shadow-brand/20',
      border: 'border-brand/10'
    }
  };

  const theme = themes[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/5"
          >
            <div className={`p-8 text-center ${theme.bg} border-b ${theme.border}`}>
              <div className={`w-16 h-16 ${theme.bg} ${theme.icon} rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm`}>
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                {message}
              </p>
            </div>

            <div className="p-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] uppercase tracking-widest text-xs ${theme.button}`}
              >
                {confirmLabel}
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs"
              >
                {cancelLabel}
              </button>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
