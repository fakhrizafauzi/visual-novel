import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Login, Game, NotFound } from './pages';
import { Dashboard as AdminDashboard } from './admin';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import BackgroundAccents from './components/ui/BackgroundAccents';

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <SnackbarProvider>
            <GameProvider>
              <Router>
                <div className="app-container" style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <Routes>
                    <Route path="/" element={<><BackgroundAccents /><Game /></>} />
                    <Route path="/login" element={<><BackgroundAccents /><Login /></>} />
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </Router>
            </GameProvider>
          </SnackbarProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Simple Error Layout
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Runtime Error:", error.error);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444' }}>
        <h2>Something went wrong.</h2>
        <p>Check the browser console for details.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#333', color: '#fff', borderRadius: '4px' }}>
          Reload Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export default App;
