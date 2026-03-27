import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, LogIn, Heart, Sparkles, Book } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="home-page" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Heart size={32} color="var(--primary-color)" fill="var(--primary-color)" />
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Magical Worlds Await
          </span>
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(3rem, 10vw, 6rem)', 
          fontWeight: 900, 
          color: 'var(--text-color)', 
          letterSpacing: '-2px',
          lineHeight: 1,
          marginBottom: '1.5rem',
          textShadow: '0 10px 30px rgba(0,0,0,0.05)'
        }}>
          Lumina <span style={{ color: 'var(--primary-color)' }}>VN</span>
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', 
          color: '#888', 
          maxWidth: '600px', 
          margin: '0 auto 3rem auto',
          lineHeight: 1.6
        }}>
          Experience interactive stories with a soft pastel touch. 
          Your journey into the magical unknown starts here.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/play">
            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="kawaii-btn" 
              style={{ 
                padding: '1.2rem 3rem', 
                fontSize: '1.2rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none'
              }}
            >
              <Play fill="white" size={20} /> Start Playing
            </motion.button>
          </Link>
          
          <Link to="/login">
            <motion.button 
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="kawaii-btn" 
              style={{ 
                padding: '1.2rem 3rem', 
                fontSize: '1.2rem',
                background: 'white',
                border: '2px solid #ffedf1',
                color: '#666'
              }}
            >
              <LogIn size={20} /> Login
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Floating Elements (Decorative) */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '20%', left: '15%', opacity: 0.5 }}
      >
        <Sparkles size={40} color="var(--primary-color)" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', bottom: '20%', right: '15%', opacity: 0.5 }}
      >
        <Book size={40} color="var(--secondary-color)" />
      </motion.div>

      {/* Stats/Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{ marginTop: '5rem', display: 'flex', gap: '3rem' }}
      >
        <div style={miniStatStyle}>
          <strong>5+</strong>
          <span>Stories</span>
        </div>
        <div style={miniStatStyle}>
          <strong>25+</strong>
          <span>Chapters</span>
        </div>
        <div style={miniStatStyle}>
          <strong>100%</strong>
          <span>Cute</span>
        </div>
      </motion.div>
    </div>
  );
};

const miniStatStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  color: '#888',
  fontSize: '0.9rem'
};

export default Home;
