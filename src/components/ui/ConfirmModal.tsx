import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCancel?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-yellow-500" size={32} />;
      case 'error': return <X className="text-red-500" size={32} />;
      case 'success': return <CheckCircle2 className="text-green-500" size={32} />;
      default: return <Info className="text-blue-500" size={32} />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'success': return '#22c55e';
      default: return 'var(--primary-color)';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="kawaii-panel"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '2rem',
              border: `1px solid ${getAccentColor()}`,
              boxShadow: `0 0 30px ${getAccentColor()}33`
            }}
          >
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ flexShrink: 0 }}>
                {getIcon()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>{title}</h3>
                <p style={{ color: '#aaa', lineHeight: '1.5' }}>{message}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {showCancel && (
                <button 
                  onClick={onCancel}
                  className="kawaii-btn" 
                  style={{ 
                    padding: '0.6rem 1.5rem', 
                    fontSize: '0.9rem',
                    background: 'transparent',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  {cancelLabel}
                </button>
              )}
              <button 
                onClick={onConfirm}
                className="kawaii-btn" 
                style={{ 
                  padding: '0.6rem 2rem', 
                  fontSize: '0.9rem',
                  background: getAccentColor(),
                  borderColor: getAccentColor(),
                  color: '#000'
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
