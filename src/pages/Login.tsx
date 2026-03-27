import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, LogOut, Zap, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const { loginWithGoogle, loginAnonymously, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (isAdmin) navigate('/admin');
      else navigate('/');
    }
  }, [user, isAdmin, navigate]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--bg)'
    }}>
      <div className="scan-line" />

      {/* LEFT — Dark Brand Panel */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        style={{
          width: '48%',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '4rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative grid */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 0, bottom: 0,
            left: `${(i / 6) * 100}%`,
            width: '1px',
            background: 'var(--border)',
            opacity: 0.5
          }} />
        ))}
        {/* Accent circle */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '400px', height: '400px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,107,0.06), transparent)'
        }} />

        {/* Corner marks */}
        <div style={{ position: 'absolute', top: '2rem', left: '2rem', width: '30px', height: '30px', borderLeft: '2px solid var(--accent)', borderTop: '2px solid var(--accent)' }} />
        <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', width: '30px', height: '30px', borderRight: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }} />

        {/* Top: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ padding: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', letterSpacing: '4px', color: 'var(--text)' }}>
            ANTIGRAVITY
          </span>
        </div>

        {/* Center: Big text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label" style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Console Access</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 6vw, 5rem)', letterSpacing: '4px', lineHeight: 1, marginBottom: '1.5rem', color: 'var(--text)' }}>
            ADMIN<br />PORTAL
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '300px' }}>
            Manage stories, chapters, scenes, assets, and global settings from a single dashboard.
          </p>
        </div>

        {/* Bottom: Version */}
        <div className="section-label" style={{ position: 'relative', zIndex: 1 }}>Engine V4.0 · 2026</div>
      </motion.div>

      {/* RIGHT — Sign In Form */}
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem',
          gap: '2rem'
        }}
      >
        {user ? (
          /* Logged in state */
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="section-label">Signed In As</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isAdmin ? <Shield size={22} color="white" /> : <UserIcon size={22} color="white" />}
              </div>
              <div>
                <div style={{ fontWeight: 800, marginBottom: '0.2rem' }}>{user.displayName || user.email || 'Anonymous'}</div>
                <div className="section-label" style={{ color: isAdmin ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {isAdmin ? 'Administrator' : 'User'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {isAdmin && (
                <button className="action-btn" style={{ flex: 2 }} onClick={() => navigate('/admin')}>
                  <Shield size={16} /> Open Dashboard
                </button>
              )}
              <button className="ghost-btn" style={{ flex: 1 }} onClick={logout}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
            <button className="ghost-btn" style={{ justifyContent: 'center' }} onClick={() => navigate('/')}>
              ← Back to Game
            </button>
          </div>
        ) : (
          /* Not logged in */
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div className="section-label" style={{ marginBottom: '0.8rem' }}>Access Level</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)' }}>Sign In</h2>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Sign in with your Google account for admin access, or continue as a guest to play stories.
            </p>

            <div style={{ height: '1px', background: 'var(--border)' }} />

            {/* Google login */}
            <motion.button
              className="action-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loginWithGoogle}
              style={{ width: '100%', justifyContent: 'center', gap: '1rem', padding: '1.1rem 2rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span className="section-label">or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Anonymous login */}
            <motion.button
              className="ghost-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loginAnonymously}
              style={{ width: '100%', justifyContent: 'center', gap: '1rem', padding: '1rem 2rem' }}
            >
              <Users size={18} /> Continue as Guest
            </motion.button>

            <button
              style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', marginTop: '0.5rem' }}
              onClick={() => navigate('/')}
            >
              ← Return to Game without signing in
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
