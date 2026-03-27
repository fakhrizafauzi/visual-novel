import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAppSettings } from '../../firebase/db';

const BackgroundAccents: React.FC = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getAppSettings();
      if (settings) {
        setShow(settings.showAccents !== false);
        if (settings.primaryColor) {
          // No longer setting these globally to prevent theme leakage from stories
          // The site-wide theme is handled by index.css and GameContext's initial load
        }
      }
    };
    fetchSettings();
  }, []);

  if (!show) return <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'var(--bg-color)' }} />;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      overflow: 'hidden',
      background: 'var(--bg-color)',
      transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none'
    }}>
      {/* Dynamic Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 0.9, 1.1, 1],
          x: [0, 100, -50, 40, 0],
          y: [0, -50, 80, -30, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'var(--primary-color)',
          opacity: 0.1,
          filter: 'blur(100px)'
        }}
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1.1, 1.2, 1],
          x: [0, -80, 60, -20, 0],
          y: [0, 40, -60, 100, 0],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-15%',
          width: '45vw',
          height: '45vw',
          borderRadius: '50%',
          background: 'var(--secondary-color)',
          opacity: 0.1,
          filter: 'blur(120px)'
        }}
      />

      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          top: '25%',
          left: '15%',
          width: '20vw',
          height: '25vw',
          border: '3px dashed var(--accent-color)',
          opacity: 0.05,
          borderRadius: '40% 60% 70% 30% / 40% 40% 60% 60%',
          filter: 'blur(2px)'
        }}
      />
    </div>
  );
};

export default BackgroundAccents;
