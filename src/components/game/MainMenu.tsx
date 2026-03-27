import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info, ChevronRight, Sun, Moon } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import SkeletonMainMenu from './SkeletonMainMenu';

interface MainMenuProps {
  onStart: () => void;
  onCredits: () => void;
}

const DECORATIVE_LINES = [20, 35, 55, 70, 85];

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onCredits }) => {
  const { appSettings, isInitialLoading } = useGame();
  const { theme, toggleTheme } = useTheme();

  if (isInitialLoading) return <SkeletonMainMenu />;

  const titleLines = (appSettings?.menuTitle || 'Eternal\nEchoes').split('\n');

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg)', display: 'flex', position: 'relative', overflow: 'hidden' }}>

      {/* Theme Toggle — top right */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 30,
          padding: '0.6rem', background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      {DECORATIVE_LINES.map((left, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: `${left}%`,
          width: '1px',
          background: 'var(--border)',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 0
        }} />
      ))}

      {/* Animated scan line */}
      <div className="scan-line" />

      {/* LEFT PANEL — Title & Identity */}
      <motion.div
        className="menu-left-panel"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          width: '55%',
          height: '100%',
          padding: '5rem 4rem 4rem 6rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          borderRight: '1px solid var(--border)'
        }}
      >
        {/* Accent corner mark */}
        <div style={{ position: 'absolute', top: '3rem', left: '6rem', width: '40px', height: '40px', borderLeft: '3px solid var(--accent)', borderTop: '3px solid var(--accent)' }} />
        <div style={{ position: 'absolute', bottom: '3rem', right: 0, width: '40px', height: '40px', borderRight: '3px solid var(--border)', borderBottom: '3px solid var(--border)' }} />

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}
        >
          <div style={{ width: '30px', height: '2px', background: 'var(--accent)' }} />
          <span className="section-label" style={{ color: 'var(--accent)', letterSpacing: '6px' }}>
            {appSettings?.id ? `PROJECT ${appSettings.id.toUpperCase()}` : 'VISUAL NOVEL ENGINE'}
          </span>
        </motion.div>

        {/* Big Title */}
        <motion.h1
          className="manga-title glitch"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ marginBottom: '1rem' }}
        >
          {titleLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </motion.h1>

        {/* Gold accent subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '5rem' }}
        >
          <div style={{ width: '50px', height: '2px', background: 'var(--accent2)' }} />
          <span className="manga-subtitle" style={{ fontSize: '1.1rem', color: 'var(--accent2)' }}>
            Interactive Story Experience
          </span>
        </motion.div>

        {/* Menu Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '380px' }}>
          <motion.button
            className="action-btn"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            style={{ width: '100%', fontSize: '1.3rem', padding: '1.2rem 2rem', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Play size={22} fill="currentColor" />
              {appSettings?.menuStartBtn || 'Start Your Journey'}
            </div>
            <ChevronRight size={22} />
          </motion.button>

          <motion.button
            className="ghost-btn"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
            onClick={onCredits}
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Info size={18} />
              {appSettings?.menuAboutBtn || 'About Project'}
            </div>
            <ChevronRight size={18} />
          </motion.button>
        </div>


      </motion.div>

      {/* RIGHT PANEL — Art / Visual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background image if set, else gradient art */}
        {appSettings?.globalBackgroundUrl ? (
          <img
            src={appSettings.globalBackgroundUrl}
            alt="Visual"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'radial-gradient(ellipse at 30% 50%, var(--accent-low) 0%, transparent 70%), linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)',
          }}>
            {/* Decorative floating elements */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -15, 0], opacity: [0.15, 0.3, 0.15] }}
                transition={{ repeat: Infinity, duration: 3 + i, delay: i * 0.5 }}
                style={{
                  position: 'absolute',
                  width: `${60 + i * 30}px`,
                  height: `${60 + i * 30}px`,
                  border: '1px solid var(--border)',
                  left: `${15 + i * 15}%`,
                  top: `${20 + i * 10}%`,
                  transform: `rotate(${i * 15}deg)`
                }}
              />
            ))}
            {/* Large accent circle */}
            <div style={{
              position: 'absolute',
              width: '400px', height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--accent-low), transparent)',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)'
            }} />
          </div>
        )}

        {/* Overlay gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 0%, transparent 30%)' }} />

        {/* Corner decoration */}
        <div style={{ position: 'absolute', top: '3rem', right: '3rem', width: '40px', height: '40px', borderRight: '3px solid var(--accent)', borderTop: '3px solid var(--accent)' }} />
        <div style={{ position: 'absolute', bottom: '3rem', left: '0', width: '40px', height: '40px', borderLeft: '3px solid var(--border)', borderBottom: '3px solid var(--border)' }} />


      </motion.div>

      {/* Center accent line */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: '55%', width: '2px',
        background: 'linear-gradient(to bottom, transparent, var(--accent), transparent)',
        opacity: 0.3,
        zIndex: 3
      }} />
    </div>
  );
};

export default MainMenu;
