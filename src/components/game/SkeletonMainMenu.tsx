import React from 'react';
import { motion } from 'framer-motion';

const SkeletonMainMenu: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative vertical lines */}
      {[20, 35, 55, 70, 85].map((left, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, bottom: 0, left: `${left}%`,
          width: '1px', background: 'var(--border)', opacity: 0.3, zIndex: 0
        }} />
      ))}

      {/* LEFT PANEL */}
      <div style={{
        width: '55%', height: '100%', padding: '5rem 4rem 4rem 6rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', zIndex: 2, borderRight: '1px solid var(--border)'
      }}>
        {/* Accent corner placeholder */}
        <div style={{ position: 'absolute', top: '3rem', left: '6rem', width: '40px', height: '40px', borderLeft: '3px solid var(--border)', borderTop: '3px solid var(--border)', opacity: 0.5 }} />

        {/* Label Placeholder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '30px', height: '2px', background: 'var(--border)' }} />
          <div className="skeleton-box" style={{ width: '180px', height: '12px' }} />
        </div>

        {/* Title Placeholders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          <div className="skeleton-box" style={{ width: '80%', height: '60px' }} />
          <div className="skeleton-box" style={{ width: '60%', height: '60px' }} />
        </div>

        {/* Subtitle Placeholder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '5rem' }}>
          <div style={{ width: '50px', height: '2px', background: 'var(--border)' }} />
          <div className="skeleton-box" style={{ width: '220px', height: '16px' }} />
        </div>

        {/* Button Placeholders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '380px' }}>
          <div className="skeleton-box" style={{ width: '100%', height: '60px', borderRadius: '0' }} />
          <div className="skeleton-box" style={{ width: '100%', height: '50px', borderRadius: '0' }} />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, background: 'var(--surface2)', position: 'relative', overflow: 'hidden' }}>
        <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, var(--border), transparent)', backgroundSize: '200% 100%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 0%, transparent 30%)' }} />
      </div>

      <style>{`
        .skeleton-box {
          background: var(--surface2);
          position: relative;
          overflow: hidden;
        }
        .skeleton-box::after {
          content: "";
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SkeletonMainMenu;
