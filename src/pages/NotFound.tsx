import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    console.log("NotFound component rendered at:", window.location.pathname);
  }, []);
  return (
    <div style={{
      zIndex: 99999,
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d0f1a',
      color: 'var(--text)',
      overflow: 'hidden'
    }}>
      {/* ── BACKGROUND LAYER (CSS-ONLY) ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0d0f1a 0%, #05060b 100%)
        `,
        zIndex: 0
      }}>
        {/* Floating Digital Bits */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.3, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 5 + Math.random() * 5,
              delay: Math.random() * 5,
            }}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: 'var(--accent)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px var(--accent)'
            }}
          />
        ))}
      </div>

      {/* Decorative Glitch Overlay */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ repeat: Infinity, duration: 4 }}
        style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(255,255,255,0.02) 3px)',
          zIndex: 1, pointerEvents: 'none'
        }}
      />

      {/* ── CONTENT ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '4rem',
          maxWidth: '600px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        {/* Corner Accents */}
        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '30px', height: '30px', borderLeft: '2px solid var(--accent)', borderTop: '2px solid var(--accent)' }} />
        <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', width: '30px', height: '30px', borderRight: '2px solid var(--accent)', borderBottom: '2px solid var(--accent)' }} />

        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{ marginBottom: '2.5rem', display: 'inline-block' }}
        >
          <AlertTriangle size={64} color="var(--accent)" />
        </motion.div>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '6rem',
          letterSpacing: '10px',
          lineHeight: 0.9,
          margin: 0,
          color: 'var(--text)'
        }}>
          404
        </h1>
        
        <div className="section-label" style={{ 
          fontSize: '1rem', 
          color: 'var(--accent)', 
          margin: '1.5rem 0',
          letterSpacing: '4px',
          textTransform: 'uppercase'
        }}>
          — Area Restricted —
        </div>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.1rem',
          lineHeight: 1.8,
          marginBottom: '3rem',
          fontWeight: 500
        }}>
          Oops! It seems you've drifted off the narrative path. The frequency you're looking for was lost in the void.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <button
            className="action-btn"
            onClick={() => navigate('/visual-novel')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 2rem' }}
          >
            <Home size={18} /> Return Home
          </button>
          
          <button
            className="ghost-btn"
            onClick={() => window.location.reload()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 2rem' }}
          >
            <RefreshCw size={18} /> Try Again
          </button>
        </div>
      </motion.div>

      {/* Subtle Bottom Watermark */}
      <div style={{
        position: 'absolute', bottom: '2rem',
        fontSize: '0.7rem', color: 'rgba(255,255,255,0.1)',
        letterSpacing: '2px', fontWeight: 900
      }}>
        ERROR_01_PATH_NOT_DEFINED
      </div>
    </div>
  );
};

export default NotFound;
