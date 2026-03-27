import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

interface SnackbarProps {
  isOpen: boolean;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

const Snackbar: React.FC<SnackbarProps> = ({ isOpen, message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="text-green-400" />;
      case 'error': return <XCircle size={20} className="text-red-400" />;
      case 'warning': return <AlertCircle size={20} className="text-yellow-400" />;
      default: return <Info size={20} className="text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            zIndex: 10000,
            minWidth: '320px',
            maxWidth: '500px'
          }}
        >
          <div className="kawaii-panel" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.5rem',
            border: `1px solid ${getBorderColor()}66`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 15px ${getBorderColor()}22`,
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ flexShrink: 0 }}>
              {getIcon()}
            </div>
            
            <div style={{ flex: 1, color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>
              {message}
            </div>

            <button 
              onClick={onClose}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#666', 
                cursor: 'pointer',
                display: 'flex',
                padding: '0.2rem'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
            >
              <X size={16} />
            </button>

            {/* Progress Bar */}
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: getBorderColor(),
                originX: 0
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Snackbar;
