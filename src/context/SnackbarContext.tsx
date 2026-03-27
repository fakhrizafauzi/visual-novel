import React, { createContext, useContext, useState, type ReactNode } from 'react';
import Snackbar from '../components/ui/Snackbar';

type SnackbarType = 'info' | 'success' | 'warning' | 'error';

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [snackbar, setSnackbar] = useState<{ isOpen: boolean; message: string; type: SnackbarType }>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const showSnackbar = (message: string, type: SnackbarType = 'info') => {
    setSnackbar({ isOpen: true, message, type });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar 
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        onClose={hideSnackbar}
      />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar must be used within SnackbarProvider');
  return context;
};
